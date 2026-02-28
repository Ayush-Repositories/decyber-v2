export const MAX_SOLVES = 3;
export const WRONG_ANSWER_PENALTY_FRACTION = 0.1;

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export function checkAnswer(submitted: string, stored: string): boolean {
  const normalized = normalize(submitted);
  if (!normalized) return false;

  if (stored.startsWith("!reject:")) {
    const rejected = stored
      .slice(8)
      .split("|")
      .map((s) => normalize(s));
    return !rejected.includes(normalized);
  }

  if (stored.includes("|")) {
    return stored
      .split("|")
      .some((a) => normalize(a) === normalized);
  }

  return normalized === normalize(stored);
}

export function scoreForNthSolve(maxScore: number, solveIndex: number): number {
  if (solveIndex >= MAX_SOLVES) return 0;
  return Math.round((maxScore * (MAX_SOLVES - solveIndex)) / MAX_SOLVES);
}

export function nextSolveScore(
  maxScore: number,
  currentSolveCount: number
): number {
  return scoreForNthSolve(maxScore, currentSolveCount);
}

export function isFullySolved(solveCount: number): boolean {
  return solveCount >= MAX_SOLVES;
}
