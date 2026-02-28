import { Request, Response, NextFunction } from "express";
import { sql } from "./db.js";

// ── Admin token store ──
const adminTokens = new Set<string>();

export function addAdminToken(token: string) {
  adminTokens.add(token);
}

export function removeAdminToken(token: string) {
  adminTokens.delete(token);
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractBearer(req);
  if (!token || !adminTokens.has(token)) {
    res.status(401).json({ error: "Unauthorized: invalid admin token" });
    return;
  }
  next();
}

// ── Team session auth ──
export async function requireTeamSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized: missing session token" });
    return;
  }
  const rows =
    await sql`SELECT id FROM teams WHERE session_token = ${token} AND logged_in = true`;
  if (rows.length === 0) {
    res.status(401).json({ error: "Unauthorized: invalid session token" });
    return;
  }
  (req as any).teamId = rows[0].id as string;
  next();
}

// ── Rate limiter by team ──
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimitByTeam(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const teamId = (req as any).teamId as string | undefined;
  if (!teamId) {
    next();
    return;
  }
  const now = Date.now();
  let bucket = rateBuckets.get(teamId);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + 60_000 };
    rateBuckets.set(teamId, bucket);
  }
  bucket.count++;
  if (bucket.count > 10) {
    res
      .status(429)
      .json({ error: "Too many attempts. Try again in a minute." });
    return;
  }
  next();
}
