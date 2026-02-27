import { WebSocket } from "ws";
import { sql } from "./db.js";

const clients = new Set<WebSocket>();

export function addClient(ws: WebSocket) {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
}

export async function broadcastState() {
  if (clients.size === 0) return;

  const [teamsRows, questionsRows, settingsRows] = await Promise.all([
    sql`SELECT id, team_name, passcode, total_score, logged_in FROM teams`,
    sql`SELECT id, state_code, state_name, title, image, answer, hint, max_score, current_score, solved, solved_by FROM questions`,
    sql`SELECT timer_running, timer_ends_at, timer_duration_minutes FROM game_settings WHERE id = 'default'`,
  ]);

  const teams = teamsRows.map((r) => ({
    id: r.id,
    name: r.team_name,
    passcode: r.passcode,
    totalScore: r.total_score,
    loggedIn: r.logged_in,
  }));

  const questions = questionsRows.map((r) => ({
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
  }));

  const settings = settingsRows[0] || {};
  const gameSettings = {
    timerRunning: settings.timer_running ?? false,
    timerEndsAt: settings.timer_ends_at ?? null,
    timerDurationMinutes: settings.timer_duration_minutes ?? 30,
  };

  const payload = JSON.stringify({
    type: "state",
    teams,
    questions,
    gameSettings,
  });

  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}
