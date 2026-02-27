import { memo, useCallback, useMemo, useState } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { getColorFromScore, SOLVED_COLOR, TIER_COLORS } from "../lib/color";
import { STATE_PATHS } from "../data/indiaMapPaths";
import { MAX_SOLVES } from "../lib/timer";

type IndiaMapProps = {
  onStateClick: (stateCode: string) => void;
  selectedTeam?: string;
};

function IndiaMapInner({ onStateClick, selectedTeam }: IndiaMapProps) {
  const questions = useQuizStore((s) => s.questions);
  const teams = useQuizStore((s) => s.teams);

  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.stateCode, q])),
    [questions]
  );

  const teamMap = useMemo(
    () => new Map(teams.map((t) => [t.id, t])),
    [teams]
  );

  const handleClick = useCallback(
    (stateCode: string) => {
      const question = questionMap.get(stateCode);
      if (!question || question.solved) return;
      if (selectedTeam && question.solvedBy.includes(selectedTeam)) return;
      onStateClick(stateCode);
    },
    [onStateClick, questionMap, selectedTeam]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const hoveredQuestion = hoveredState ? questionMap.get(hoveredState) : null;
  const hoveredStateName = hoveredState
    ? STATE_PATHS[hoveredState]?.name ?? hoveredState
    : null;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative" onMouseMove={handleMouseMove}>
        <svg
          viewBox="0 0 612 696"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Object.entries(STATE_PATHS)
            .sort(([a], [b]) =>
              a === hoveredState ? 1 : b === hoveredState ? -1 : 0
            )
            .map(([stateCode, stateData]) => {
              const question = questionMap.get(stateCode);
              const hasQuestion = !!question;
              const fullySolved = question?.solved ?? false;
              const solveCount = question?.solvedBy.length ?? 0;
              const solvedBySelectedTeam =
                !!selectedTeam && !!question && question.solvedBy.includes(selectedTeam);

              const isDone = fullySolved || solvedBySelectedTeam;
              const isClickable = hasQuestion && !fullySolved && !solvedBySelectedTeam;
              const isHovered = hoveredState === stateCode;

              const fillColor = hasQuestion
                ? isDone
                  ? SOLVED_COLOR
                  : getColorFromScore(question.currentScore, question.maxScore, false)
                : "#1a1a2e";

              return (
                <g key={stateCode}>
                  <path
                    d={stateData.d}
                    fill={fillColor}
                    stroke={isHovered ? "#39ff14" : "#0a0a0a"}
                    strokeWidth={isHovered ? 1.5 : 0.3}
                    strokeLinejoin="round"
                    className={
                      isClickable
                        ? "cursor-pointer transition-all duration-300 hover:brightness-125"
                        : "cursor-default" + (!hasQuestion ? " opacity-50" : "")
                    }
                    onClick={() => hasQuestion && handleClick(stateCode)}
                    onMouseEnter={() => hasQuestion && setHoveredState(stateCode)}
                    onMouseLeave={() => setHoveredState(null)}
                    style={{ transition: "fill 0.5s ease" }}
                  />
                  {isDone && hasQuestion && (
                    <SolvedBadge pathD={stateData.d} solveCount={solveCount} />
                  )}
                </g>
              );
            })}
        </svg>

        {hoveredState && hoveredQuestion && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltipPos.x + 14, top: tooltipPos.y + 14 }}
          >
            <div className="bg-[#0f0f1a]/95 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-xl shadow-2xl max-w-xs">
              <p className="text-[#39ff14] text-xs uppercase tracking-widest font-semibold">
                {hoveredStateName}
              </p>
              {hoveredQuestion.solved ? (
                <p className="text-white/40 text-xs mt-1">Fully solved</p>
              ) : selectedTeam && hoveredQuestion.solvedBy.includes(selectedTeam) ? (
                <p className="text-white/40 text-xs mt-1">You solved this</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mt-2 gap-6">
                    <span className="text-white/50 text-xs">
                      Worth {hoveredQuestion.currentScore} / {hoveredQuestion.maxScore} pts
                    </span>
                    <span className="text-white/50 text-xs">
                      {hoveredQuestion.solvedBy.length}/{MAX_SOLVES} solved
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(hoveredQuestion.currentScore / hoveredQuestion.maxScore) * 100}%`,
                        backgroundColor: getColorFromScore(
                          hoveredQuestion.currentScore,
                          hoveredQuestion.maxScore,
                          false
                        ),
                      }}
                    />
                  </div>
                </>
              )}
              {hoveredQuestion.solvedBy.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-0.5">
                  {hoveredQuestion.solvedBy.map((teamId, i) => {
                    const team = teamMap.get(teamId);
                    return (
                      <div key={teamId} className="flex items-center gap-2 text-xs">
                        <span className="text-[#39ff14] font-bold w-4">#{i + 1}</span>
                        <span className={`${teamId === selectedTeam ? "text-[#39ff14]" : "text-white/60"}`}>
                          {team?.name ?? "Unknown"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <MapLegend />
    </div>
  );
}

function MapLegend() {
  const legendItems = [
    { color: TIER_COLORS.high, label: "200+ pts" },
    { color: TIER_COLORS.mid, label: "150+ pts" },
    { color: TIER_COLORS.low, label: "100+ pts" },
    { color: TIER_COLORS.lowest, label: "< 100 pts" },
    { color: SOLVED_COLOR, label: "Solved" },
  ];

  return (
    <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm border border-white/10"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[10px] text-white/50 uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm border border-white/10 bg-[#1a1a2e] opacity-50" />
        <span className="text-[10px] text-white/50 uppercase tracking-wider">
          No question
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/30 italic">
          Dimmer = fewer points remaining
        </span>
      </div>
    </div>
  );
}

function SolvedBadge({ pathD, solveCount }: { pathD: string; solveCount: number }) {
  const coords = pathD.match(/[\d.]+/g)?.map(Number) ?? [];
  let cx = 0;
  let cy = 0;
  let count = 0;
  for (let i = 0; i < coords.length - 1; i += 2) {
    cx += coords[i];
    cy += coords[i + 1];
    count++;
  }
  if (count > 0) {
    cx /= count;
    cy /= count;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#39ff14" opacity={0.9} />
      <text
        x={cx}
        y={cy + 0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="5.5"
        fontWeight="bold"
        fill="#0a0a0a"
      >
        {solveCount}
      </text>
    </g>
  );
}

export const IndiaMap = memo(IndiaMapInner);
