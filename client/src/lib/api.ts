import type { Team, Question } from "../store/useQuizStore";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Team functions ──

export async function fetchAllTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE}/api/teams`);
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export async function addTeam(name: string, passcode: string): Promise<Team> {
  const res = await fetch(`${BASE}/api/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, passcode }),
  });
  if (!res.ok) throw new Error("Failed to add team");
  return res.json();
}

export async function removeTeam(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/teams/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove team");
}

export async function loginTeam(
  name: string,
  passcode: string
): Promise<{ result: "success" | "invalid" | "already_used"; team?: Team }> {
  const res = await fetch(`${BASE}/api/teams/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, passcode }),
  });
  if (!res.ok) throw new Error("Failed to login");
  return res.json();
}

export async function resetTeamLogin(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/teams/${id}/reset-login`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset login");
}

export async function updateTeamScore(id: string, newScore: number): Promise<void> {
  const res = await fetch(`${BASE}/api/teams/${id}/score`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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

export async function addQuestion(
  q: Omit<Question, "currentScore" | "solved" | "solvedBy">
): Promise<Question> {
  const res = await fetch(`${BASE}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
  });
  if (!res.ok) throw new Error("Failed to add question");
  return res.json();
}

export async function updateQuestion(
  id: string,
  updates: Partial<Pick<Question, "title" | "answer" | "image" | "maxScore" | "hint">>
): Promise<void> {
  const res = await fetch(`${BASE}/api/questions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update question");
}

export async function deleteQuestion(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/questions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function resetQuestion(id: string, maxScore: number): Promise<void> {
  const res = await fetch(`${BASE}/api/questions/${id}/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxScore }),
  });
  if (!res.ok) throw new Error("Failed to reset question");
}

export async function submitQuestionAnswer(
  id: string,
  solvedBy: string[],
  currentScore: number,
  solved: boolean
): Promise<void> {
  const res = await fetch(`${BASE}/api/questions/${id}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ solvedBy, currentScore, solved }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ durationMinutes }),
  });
  if (!res.ok) throw new Error("Failed to start timer");
}

export async function stopGameTimer(): Promise<void> {
  const res = await fetch(`${BASE}/api/game/stop`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to stop timer");
}
