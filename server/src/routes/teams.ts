import { Router, Request, Response } from "express";
import crypto from "crypto";
import { sql } from "../db.js";
import { broadcastState } from "../ws.js";
import { requireAdmin } from "../middleware.js";

const router = Router();

function stripPasscode(r: Record<string, unknown>) {
  return {
    id: r.id,
    name: r.team_name,
    totalScore: r.total_score,
    loggedIn: r.logged_in,
  };
}

// POST /api/teams/login
router.post("/login", async (req: Request, res: Response) => {
  const { name, passcode } = req.body;
  const rows = await sql`
    SELECT id, team_name, total_score, logged_in
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
  const sessionToken = crypto.randomUUID();
  await sql`UPDATE teams SET logged_in = true, session_token = ${sessionToken} WHERE id = ${row.id}`;
  await broadcastState();
  res.json({
    result: "success",
    sessionToken,
    team: {
      id: row.id,
      name: row.team_name,
      totalScore: row.total_score,
      loggedIn: true,
    },
  });
});

// POST /api/teams — protected
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const { name, passcode } = req.body;
  const rows = await sql`
    INSERT INTO teams (team_name, passcode, total_score, logged_in)
    VALUES (${name}, ${passcode}, 0, false)
    RETURNING id, team_name, total_score, logged_in
  `;
  const r = rows[0];
  await broadcastState();
  res.json(stripPasscode(r));
});

// DELETE /api/teams/:id — protected
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`DELETE FROM teams WHERE id = ${id}`;
  await broadcastState();
  res.json({ ok: true });
});

// POST /api/teams/:id/reset-login — protected
router.post("/:id/reset-login", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`UPDATE teams SET logged_in = false, session_token = null WHERE id = ${id}`;
  await broadcastState();
  res.json({ ok: true });
});

// PUT /api/teams/:id/score — protected
router.put("/:id/score", requireAdmin, async (req: Request, res: Response) => {
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

// GET /api/teams/:id — no passcode
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const rows = await sql`
    SELECT id, team_name, total_score, logged_in
    FROM teams WHERE id = ${id}
  `;
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(stripPasscode(rows[0]));
});

// GET /api/teams — no passcode
router.get("/", async (_req: Request, res: Response) => {
  const rows = await sql`SELECT id, team_name, total_score, logged_in FROM teams`;
  res.json(rows.map(stripPasscode));
});

export default router;
