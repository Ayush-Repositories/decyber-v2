import { Router, Request, Response } from "express";
import { sql } from "../db.js";
import { broadcastState } from "../ws.js";
import {
  requireAdmin,
  requireTeamSession,
  rateLimitByTeam,
} from "../middleware.js";
import {
  checkAnswer,
  scoreForNthSolve,
  nextSolveScore,
  isFullySolved,
  WRONG_ANSWER_PENALTY_FRACTION,
} from "../answer.js";

const router = Router();

function mapRowPublic(r: Record<string, unknown>) {
  return {
    id: r.id,
    stateCode: r.state_code,
    stateName: r.state_name,
    title: r.title,
    image: r.image,
    hint: r.hint,
    maxScore: r.max_score,
    currentScore: r.current_score,
    solved: r.solved,
    solvedBy: r.solved_by,
  };
}

function mapRowAdmin(r: Record<string, unknown>) {
  return {
    ...mapRowPublic(r),
    answer: r.answer,
  };
}

// GET /api/questions — public (no answers)
router.get("/", async (req: Request, res: Response) => {
  const round = req.query.round;
  let rows;
  if (round) {
    rows = await sql`
      SELECT id, state_code, state_name, title, image, hint,
             max_score, current_score, solved, solved_by
      FROM questions WHERE round_number = ${Number(round)}
    `;
  } else {
    rows = await sql`
      SELECT id, state_code, state_name, title, image, hint,
             max_score, current_score, solved, solved_by
      FROM questions
    `;
  }
  res.json(rows.map(mapRowPublic));
});

// GET /api/questions/admin — protected, includes answers
router.get("/admin", requireAdmin, async (_req: Request, res: Response) => {
  const rows = await sql`
    SELECT id, state_code, state_name, title, image, answer, hint,
           max_score, current_score, solved, solved_by
    FROM questions
  `;
  res.json(rows.map(mapRowAdmin));
});

// POST /api/questions — protected
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const q = req.body;
  const rows = await sql`
    INSERT INTO questions (id, state_code, state_name, title, image, answer, hint, max_score, current_score, solved, solved_by)
    VALUES (${q.id}, ${q.stateCode}, ${q.stateName}, ${q.title}, ${q.image}, ${q.answer}, ${q.hint}, ${q.maxScore}, ${q.maxScore}, false, '{}')
    RETURNING id, state_code, state_name, title, image, answer, hint, max_score, current_score, solved, solved_by
  `;
  await broadcastState();
  res.json(mapRowAdmin(rows[0]));
});

// PUT /api/questions/:id — protected
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
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

// DELETE /api/questions/:id — protected
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`DELETE FROM questions WHERE id = ${id}`;
  await broadcastState();
  res.json({ ok: true });
});

// POST /api/questions/:id/reset — protected, deducts scores from teams
router.post(
  "/:id/reset",
  requireAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const qRows = await sql`SELECT max_score, solved_by FROM questions WHERE id = ${id}`;
    if (qRows.length > 0) {
      const maxScore = qRows[0].max_score as number;
      const solvedBy = (qRows[0].solved_by || []) as string[];
      for (let i = 0; i < solvedBy.length; i++) {
        const earned = scoreForNthSolve(maxScore, i);
        if (earned > 0) {
          await sql`UPDATE teams SET total_score = GREATEST(0, total_score - ${earned}) WHERE id = ${solvedBy[i]}`;
        }
      }
    }
    await sql`
      UPDATE questions
      SET solved = false, solved_by = '{}', current_score = max_score
      WHERE id = ${id}
    `;
    await broadcastState();
    res.json({ ok: true });
  }
);

// POST /api/questions/:id/answer — team session + rate limited, server-side validation
router.post(
  "/:id/answer",
  requireTeamSession,
  rateLimitByTeam,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const teamId = (req as any).teamId as string;
    const { answer } = req.body;

    if (!answer || typeof answer !== "string") {
      res.status(400).json({ error: "Answer is required" });
      return;
    }

    // Check game is active
    const [settings] = await sql`
      SELECT timer_running, timer_ends_at FROM game_settings WHERE id = 'default'
    `;
    if (
      !settings.timer_running ||
      !settings.timer_ends_at ||
      new Date(settings.timer_ends_at as string).getTime() < Date.now()
    ) {
      res.json({ result: "inactive" });
      return;
    }

    // Fetch question
    const qRows = await sql`
      SELECT id, answer, max_score, current_score, solved, solved_by
      FROM questions WHERE id = ${id}
    `;
    if (qRows.length === 0) {
      res.status(404).json({ error: "Question not found" });
      return;
    }
    const question = qRows[0];
    const solvedBy = (question.solved_by || []) as string[];

    if (question.solved) {
      res.json({ result: "solved" });
      return;
    }
    if (solvedBy.includes(teamId)) {
      res.json({ result: "already" });
      return;
    }

    const storedAnswer = question.answer as string;
    const isCorrect = checkAnswer(answer, storedAnswer);

    if (!isCorrect) {
      const penalty = Math.round(
        (question.max_score as number) * WRONG_ANSWER_PENALTY_FRACTION
      );
      if (penalty > 0) {
        await sql`UPDATE teams SET total_score = total_score - ${penalty} WHERE id = ${teamId}`;
      }
      await broadcastState();
      res.json({ result: "wrong", penalty });
      return;
    }

    // Correct answer — atomic conditional update to prevent race conditions
    const newSolvedBy = [...solvedBy, teamId];
    const earnedScore = scoreForNthSolve(
      question.max_score as number,
      solvedBy.length
    );
    const newCurrentScore = nextSolveScore(
      question.max_score as number,
      newSolvedBy.length
    );
    const newSolved = isFullySolved(newSolvedBy.length);

    const currentSolvedByJson = JSON.stringify(solvedBy);
    const updated = await sql`
      UPDATE questions
      SET solved_by = ${newSolvedBy as any},
          current_score = ${newCurrentScore},
          solved = ${newSolved}
      WHERE id = ${id}
        AND solved_by::text = ${currentSolvedByJson}
      RETURNING id
    `;

    if (updated.length === 0) {
      res.json({ result: "retry" });
      return;
    }

    // Update team score
    await sql`UPDATE teams SET total_score = total_score + ${earnedScore} WHERE id = ${teamId}`;
    await broadcastState();

    res.json({ result: "correct", earnedScore });
  }
);

export default router;
