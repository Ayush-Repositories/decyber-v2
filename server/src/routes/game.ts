import { Router, Request, Response } from "express";
import crypto from "crypto";
import { sql } from "../db.js";
import { broadcastState } from "../ws.js";
import { requireAdmin, addAdminToken } from "../middleware.js";

const router = Router();

// GET /api/game/settings
router.get("/settings", async (_req: Request, res: Response) => {
  const [settings] = await sql`
    SELECT timer_running, timer_ends_at, timer_duration_minutes
    FROM game_settings WHERE id = 'default'
  `;
  const [timeRow] = await sql`SELECT now() AS server_now`;
  const serverNow = new Date(timeRow.server_now as string).getTime();

  res.json({
    timerRunning: settings.timer_running,
    timerEndsAt: settings.timer_ends_at,
    timerDurationMinutes: settings.timer_duration_minutes,
    serverNow,
  });
});

// POST /api/game/start — protected
router.post("/start", requireAdmin, async (req: Request, res: Response) => {
  const { durationMinutes } = req.body;
  await sql`
    UPDATE game_settings
    SET timer_running = true,
        timer_ends_at = now() + (${durationMinutes} || ' minutes')::interval,
        timer_duration_minutes = ${durationMinutes}
    WHERE id = 'default'
  `;
  await broadcastState();
  res.json({ ok: true });
});

// POST /api/game/stop — protected
router.post("/stop", requireAdmin, async (_req: Request, res: Response) => {
  await sql`
    UPDATE game_settings
    SET timer_running = false, timer_ends_at = null
    WHERE id = 'default'
  `;
  await broadcastState();
  res.json({ ok: true });
});

// GET /api/server-time
router.get("/server-time", async (_req: Request, res: Response) => {
  const [row] = await sql`SELECT now() AS server_now`;
  res.json({ serverNow: new Date(row.server_now as string).getTime() });
});

// POST /api/admin/verify — returns a bearer token
router.post("/admin/verify", (req: Request, res: Response) => {
  const { key } = req.body;
  if (key === process.env.ADMIN_KEY) {
    const token = crypto.randomUUID();
    addAdminToken(token);
    res.json({ ok: true, token });
  } else {
    res.status(401).json({ ok: false, error: "Invalid admin key" });
  }
});

export default router;
