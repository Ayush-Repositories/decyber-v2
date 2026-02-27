import { Router, Request, Response } from "express";
import { sql } from "../db.js";
import { broadcastState } from "../ws.js";

const router = Router();

// POST /api/submissions
router.post("/", async (req: Request, res: Response) => {
  const { teamId, submissions } = req.body;
  for (const s of submissions) {
    await sql`
      INSERT INTO submissions (team_id, question_id, submitted_answer, is_correct, points_awarded)
      VALUES (${teamId}, ${s.questionId}, ${s.submittedAnswer}, ${s.isCorrect}, ${s.pointsAwarded})
    `;
  }
  if (submissions.length > 0) {
    const totalPoints = submissions.reduce(
      (sum: number, s: { pointsAwarded: number }) => sum + s.pointsAwarded,
      0
    );
    await sql`
      UPDATE teams SET total_score = total_score + ${totalPoints} WHERE id = ${teamId}
    `;
  }
  await broadcastState();
  res.json({ ok: true });
});

// POST /api/submissions/check
router.post("/check", async (req: Request, res: Response) => {
  const { teamId, roundNumber } = req.body;
  const rows = await sql`
    SELECT s.id
    FROM submissions s
    JOIN questions q ON s.question_id = q.id
    WHERE s.team_id = ${teamId} AND q.round_number = ${roundNumber}
    LIMIT 1
  `;
  res.json({ hasSubmitted: rows.length > 0 });
});

export default router;
