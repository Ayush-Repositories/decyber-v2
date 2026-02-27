import { Router, Request, Response } from "express";
import { sql } from "../db.js";
import { broadcastState } from "../ws.js";

const router = Router();

function mapRow(r: Record<string, unknown>) {
  return {
    id: r.id,
    stateCode: r.state_code,
    stateName: r.state_name,
    title: r.title,
    image: r.image,
    answer: r.answer,
    hint: r.hint,
    maxScore: r.max_score,
    currentScore: r.current_score,
    solved: r.solved,
    solvedBy: r.solved_by,
  };
}

// GET /api/questions
router.get("/", async (req: Request, res: Response) => {
  const round = req.query.round;
  let rows;
  if (round) {
    rows = await sql`
      SELECT id, state_code, state_name, title, image, answer, hint,
             max_score, current_score, solved, solved_by
      FROM questions WHERE round_number = ${Number(round)}
    `;
  } else {
    rows = await sql`
      SELECT id, state_code, state_name, title, image, answer, hint,
             max_score, current_score, solved, solved_by
      FROM questions
    `;
  }
  res.json(rows.map(mapRow));
});

// POST /api/questions
router.post("/", async (req: Request, res: Response) => {
  const q = req.body;
  const rows = await sql`
    INSERT INTO questions (id, state_code, state_name, title, image, answer, hint, max_score, current_score, solved, solved_by)
    VALUES (${q.id}, ${q.stateCode}, ${q.stateName}, ${q.title}, ${q.image}, ${q.answer}, ${q.hint}, ${q.maxScore}, ${q.maxScore}, false, '{}')
    RETURNING id, state_code, state_name, title, image, answer, hint, max_score, current_score, solved, solved_by
  `;
  await broadcastState();
  res.json(mapRow(rows[0]));
});

// PUT /api/questions/:id
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.title !== undefined) {
    await sql`UPDATE questions SET title = ${updates.title} WHERE id = ${id}`;
  }
  if (updates.answer !== undefined) {
    await sql`UPDATE questions SET answer = ${updates.answer} WHERE id = ${id}`;
  }
  if (updates.image !== undefined) {
    await sql`UPDATE questions SET image = ${updates.image} WHERE id = ${id}`;
  }
  if (updates.hint !== undefined) {
    await sql`UPDATE questions SET hint = ${updates.hint} WHERE id = ${id}`;
  }
  if (updates.maxScore !== undefined) {
    await sql`UPDATE questions SET max_score = ${updates.maxScore}, current_score = ${updates.maxScore} WHERE id = ${id}`;
  }
  await broadcastState();
  res.json({ ok: true });
});

// DELETE /api/questions/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`DELETE FROM questions WHERE id = ${id}`;
  await broadcastState();
  res.json({ ok: true });
});

// POST /api/questions/:id/reset
router.post("/:id/reset", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { maxScore } = req.body;
  await sql`
    UPDATE questions
    SET solved = false, solved_by = '{}', current_score = ${maxScore}
    WHERE id = ${id}
  `;
  await broadcastState();
  res.json({ ok: true });
});

// POST /api/questions/:id/submit
router.post("/:id/submit", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { solvedBy, currentScore, solved } = req.body;
  await sql`
    UPDATE questions
    SET solved_by = ${solvedBy}, current_score = ${currentScore}, solved = ${solved}
    WHERE id = ${id}
  `;
  await broadcastState();
  res.json({ ok: true });
});

export default router;
