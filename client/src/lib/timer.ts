const MAX_SOLVES = 5;

export function scoreForNthSolve(maxScore: number, solveIndex: number): number {
  if (solveIndex >= MAX_SOLVES) return 0;
  return Math.round((maxScore * (MAX_SOLVES - solveIndex)) / MAX_SOLVES);
}

export function nextSolveScore(maxScore: number, currentSolveCount: number): number {
  return scoreForNthSolve(maxScore, currentSolveCount);
}

export function isFullySolved(solveCount: number): boolean {
  return solveCount >= MAX_SOLVES;
}

export { MAX_SOLVES };
