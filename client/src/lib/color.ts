export const SOLVED_COLOR = "#161a1a";

const BG: [number, number, number] = [14, 18, 18];

const TIERS: Record<string, [number, number, number]> = {
  high:   [45, 180, 50],
  mid:    [35, 140, 45],
  low:    [28, 105, 40],
  lowest: [22, 75, 35],
};

function tierFor(maxScore: number): [number, number, number] {
  if (maxScore >= 200) return TIERS.high;
  if (maxScore >= 150) return TIERS.mid;
  if (maxScore >= 100) return TIERS.low;
  return TIERS.lowest;
}

export function getColorFromScore(
  currentScore: number,
  maxScore: number,
  solved: boolean
): string {
  if (solved) return SOLVED_COLOR;
  const ratio = maxScore > 0 ? Math.max(0, Math.min(1, currentScore / maxScore)) : 0;
  const tier = tierFor(maxScore);
  const r = Math.round(BG[0] + (tier[0] - BG[0]) * ratio);
  const g = Math.round(BG[1] + (tier[1] - BG[1]) * ratio);
  const b = Math.round(BG[2] + (tier[2] - BG[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export const TIER_COLORS = {
  high:   `rgb(${TIERS.high.join(", ")})`,
  mid:    `rgb(${TIERS.mid.join(", ")})`,
  low:    `rgb(${TIERS.low.join(", ")})`,
  lowest: `rgb(${TIERS.lowest.join(", ")})`,
};
