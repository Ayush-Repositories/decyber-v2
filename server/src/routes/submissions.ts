import { Router, Request, Response } from "express";
import { sql } from "../db.js";
import { broadcastState } from "../ws.js";
import { requireTeamSession } from "../middleware.js";
import { checkAnswer } from "../answer.js";

const router = Router();

// POST /api/submissions — server-side answer checking for Round 1
router.post("/", requireTeamSession, async (req: Request, res: Response) => {
  const teamId = (req as any).teamId as string;
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    res.status(400).json({ error: "answers array is required" });
    return;
  }

  // Check if already submitted for round 1
  const existingRows = await sql`
    SELECT s.id FROM submissions s
    JOIN questions q ON s.question_id = q.id
    WHERE s.team_id = ${teamId} AND q.round_number = 1
    LIMIT 1
  `;
  if (existingRows.length > 0) {
    res.json({ ok: true, alreadySubmitted: true });
    return;
  }

  // Fetch all questions to validate answers server-side
  const questionIds = answers.map(
    (a: { questionId: string }) => a.questionId
  );
  const qRows =
    await sql`SELECT id, answer, max_score FROM questions WHERE id = ANY(${questionIds as any})`;
  const questionMap = new Map(
    qRows.map((r) => [r.id as string, r])
  );

  let totalPoints = 0;
  const submissionData: {
    questionId: string;
    submittedAnswer: string;
    isCorrect: boolean;
    pointsAwarded: number;
  }[] = [];

  for (const a of answers as {
    questionId: string;
    submittedAnswer: string;
  }[]) {
    const q = questionMap.get(a.questionId);
    if (!q) continue;
    const isCorrect = checkAnswer(a.submittedAnswer, q.answer as string);
    const points = isCorrect ? (q.max_score as number) : 0;
    totalPoints += points;
    submissionData.push({
      questionId: a.questionId,
      submittedAnswer: a.submittedAnswer,
      isCorrect,
      pointsAwarded: points,
    });
  }

  for (const s of submissionData) {
    await sql`
      INSERT INTO submissions (team_id, question_id, submitted_answer, is_correct, points_awarded)
      VALUES (${teamId}, ${s.questionId}, ${s.submittedAnswer}, ${s.isCorrect}, ${s.pointsAwarded})
    `;
  }

  if (totalPoints > 0) {
    await sql`UPDATE teams SET total_score = total_score + ${totalPoints} WHERE id = ${teamId}`;
  }

  await broadcastState();
  res.json({ ok: true, totalPoints });
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
