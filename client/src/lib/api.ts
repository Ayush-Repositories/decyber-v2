import type { Team, Question } from "../store/useQuizStore";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Token management ──
let sessionToken: string | null = null;
let adminToken: string | null = null;

export function setSessionToken(token: string | null) {
  sessionToken = token;
}
export function getSessionToken() {
  return sessionToken;
}
export function setAdminToken(token: string | null) {
  adminToken = token;
}
export function getAdminToken() {
  return adminToken;
}

function sessionHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (sessionToken) h["Authorization"] = `Bearer ${sessionToken}`;
  return h;
}

function adminHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (adminToken) h["Authorization"] = `Bearer ${adminToken}`;
  return h;
}

// ── Team functions ──

export async function fetchAllTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE}/api/teams`);
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export async function addTeam(name: string, passcode: string): Promise<Team> {
  const res = await fetch(`${BASE}/api/teams`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ name, passcode }),
  });
  if (!res.ok) throw new Error("Failed to add team");
  return res.json();
}

export async function removeTeam(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/teams/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to remove team");
}

export async function loginTeam(
  name: string,
  passcode: string
): Promise<{ result: "success" | "invalid" | "already_used"; team?: Team; sessionToken?: string }> {
  const res = await fetch(`${BASE}/api/teams/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, passcode }),
  });
  if (!res.ok) throw new Error("Failed to login");
  return res.json();
}

export async function resetTeamLogin(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/teams/${id}/reset-login`, {
    method: "POST",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reset login");
}

export async function updateTeamScore(id: string, newScore: number): Promise<void> {
  const res = await fetch(`${BASE}/api/teams/${id}/score`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ score: newScore }),
  });
  if (!res.ok) throw new Error("Failed to update score");
}

export async function checkTeamStatus(id: string): Promise<{ exists: boolean; loggedIn: boolean }> {
  const res = await fetch(`${BASE}/api/teams/${id}/status`);
  if (!res.ok) throw new Error("Failed to check status");
  return res.json();
}

// ── Question functions ──

export async function fetchAllQuestions(): Promise<Question[]> {
  const res = await fetch(`${BASE}/api/questions`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export async function fetchAdminQuestions(): Promise<(Question & { answer: string })[]> {
  const res = await fetch(`${BASE}/api/questions/admin`, {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch admin questions");
  return res.json();
}

export async function addQuestion(
  q: Omit<Question, "currentScore" | "solved" | "solvedBy"> & { answer: string }
): Promise<Question & { answer: string }> {
  const res = await fetch(`${BASE}/api/questions`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(q),
  });
  if (!res.ok) throw new Error("Failed to add question");
  return res.json();
}

export async function updateQuestion(
  id: string,
  updates: Partial<Pick<Question, "title" | "image" | "maxScore" | "hint"> & { answer: string }>
): Promise<void> {
  const res = await fetch(`${BASE}/api/questions/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update question");
}

export async function deleteQuestion(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/questions/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function resetQuestion(id: string, maxScore: number): Promise<void> {
  const res = await fetch(`${BASE}/api/questions/${id}/reset`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ maxScore }),
  });
  if (!res.ok) throw new Error("Failed to reset question");
}

export async function submitAnswer(
  questionId: string,
  answer: string
): Promise<{ result: "correct" | "wrong" | "already" | "solved" | "inactive" | "retry"; penalty?: number; earnedScore?: number }> {
  const res = await fetch(`${BASE}/api/questions/${questionId}/answer`, {
    method: "POST",
    headers: sessionHeaders(),
    body: JSON.stringify({ answer }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
}

// ── Game settings functions ──

export type GameSettings = {
  timerRunning: boolean;
  timerEndsAt: string | null;
  timerDurationMinutes: number;
  serverNow: number;
};

export async function fetchGameSettings(): Promise<GameSettings> {
  const res = await fetch(`${BASE}/api/game/settings`);
  if (!res.ok) throw new Error("Failed to fetch game settings");
  return res.json();
}

export async function startGameTimer(durationMinutes: number): Promise<void> {
  const res = await fetch(`${BASE}/api/game/start`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ durationMinutes }),
  });
  if (!res.ok) throw new Error("Failed to start timer");
}

export async function stopGameTimer(): Promise<void> {
  const res = await fetch(`${BASE}/api/game/stop`, {
    method: "POST",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to stop timer");
}

// ── Submissions ──

export async function submitRoundOne(
  answers: { questionId: string; submittedAnswer: string }[]
): Promise<{ ok: boolean; totalPoints?: number; alreadySubmitted?: boolean }> {
  const res = await fetch(`${BASE}/api/submissions`, {
    method: "POST",
    headers: sessionHeaders(),
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error("Failed to submit round one");
  return res.json();
}
