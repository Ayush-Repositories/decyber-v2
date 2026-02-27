import { Router, Request, Response } from "express";
import { sql } from "../db.js";
import { broadcastState } from "../ws.js";

const router = Router();

// POST /api/teams/login
router.post("/login", async (req: Request, res: Response) => {
  const { name, passcode } = req.body;
  const rows = await sql`
    SELECT id, team_name, passcode, total_score, logged_in
    FROM teams
    WHERE LOWER(team_name) = LOWER(${name.trim()})
      AND passcode = ${passcode.trim()}
    LIMIT 1
  `;
  if (rows.length === 0) {
    res.json({ result: "invalid" });
    return;
  }
  const row = rows[0];
  if (row.logged_in) {
    res.json({ result: "already_used" });
    return;
  }
  await sql`UPDATE teams SET logged_in = true WHERE id = ${row.id}`;
  await broadcastState();
  res.json({
    result: "success",
    team: {
      id: row.id,
      name: row.team_name,
      passcode: row.passcode,
      totalScore: row.total_score,
      loggedIn: true,
    },
  });
});

// POST /api/teams
router.post("/", async (req: Request, res: Response) => {
  const { name, passcode } = req.body;
  const rows = await sql`
    INSERT INTO teams (team_name, passcode, total_score, logged_in)
    VALUES (${name}, ${passcode}, 0, false)
    RETURNING id, team_name, passcode, total_score, logged_in
  `;
  const r = rows[0];
  await broadcastState();
  res.json({
    id: r.id,
    name: r.team_name,
    passcode: r.passcode,
    totalScore: r.total_score,
    loggedIn: r.logged_in,
  });
});

// DELETE /api/teams/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`DELETE FROM teams WHERE id = ${id}`;
  await broadcastState();
  res.json({ ok: true });
});

// POST /api/teams/:id/reset-login
router.post("/:id/reset-login", async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`UPDATE teams SET logged_in = false WHERE id = ${id}`;
  await broadcastState();
  res.json({ ok: true });
});

// PUT /api/teams/:id/score
router.put("/:id/score", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { score } = req.body;
  await sql`UPDATE teams SET total_score = ${score} WHERE id = ${id}`;
  await broadcastState();
  res.json({ ok: true });
});

// GET /api/teams/:id/status
router.get("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const rows = await sql`SELECT id, logged_in FROM teams WHERE id = ${id}`;
  if (rows.length === 0) {
    res.json({ exists: false, loggedIn: false });
    return;
  }
  res.json({ exists: true, loggedIn: rows[0].logged_in });
});

// GET /api/teams/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const rows = await sql`
    SELECT id, team_name, passcode, total_score, logged_in
    FROM teams WHERE id = ${id}
  `;
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const r = rows[0];
  res.json({
    id: r.id,
    name: r.team_name,
    passcode: r.passcode,
    totalScore: r.total_score,
    loggedIn: r.logged_in,
  });
});

// GET /api/teams
router.get("/", async (_req: Request, res: Response) => {
  const rows = await sql`SELECT id, team_name, passcode, total_score, logged_in FROM teams`;
  const teams = rows.map((r) => ({
    id: r.id,
    name: r.team_name,
    passcode: r.passcode,
    totalScore: r.total_score,
    loggedIn: r.logged_in,
  }));
  res.json(teams);
});

export default router;
