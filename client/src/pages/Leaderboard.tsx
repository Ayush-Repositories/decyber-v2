import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuizStore, useHasHydrated } from "../store/useQuizStore";
import { STATE_PATHS } from "../data/indiaMapPaths";
import { getColorFromScore, SOLVED_COLOR } from "../lib/color";

export default function Leaderboard() {
  const teams = useQuizStore((s) => s.teams);
  const questions = useQuizStore((s) => s.questions);
  const teamsLoaded = useQuizStore((s) => s.teamsLoaded);
  const questionsLoaded = useQuizStore((s) => s.questionsLoaded);
  const hasHydrated = useHasHydrated();

  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => b.totalScore - a.totalScore), [teams]);
  const questionMap = useMemo(() => new Map(questions.map((q) => [q.stateCode, q])), [questions]);
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const hoveredQuestion = hoveredState ? questionMap.get(hoveredState) : null;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  if (!hasHydrated || !teamsLoaded || !questionsLoaded) {
    return (
      <div className="min-h-screen bg-black text-[#39ff14] flex items-center justify-center font-mono uppercase tracking-widest text-sm animate-pulse">
        Fetching Global Standings...
      </div>
    );
  }

  const solvedCount = questions.filter((q) => q.solved).length;

  return (
    <main className="min-h-screen p-8 bg-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10 pt-10">
        <div className="flex justify-between items-end border-b border-[#39ff14]/30 pb-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-mono text-neon uppercase tracking-widest drop-shadow-md">Global Standings</h1>
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mt-2">
              Live updating ranking matrix &middot; {solvedCount}/{questions.length} questions fully solved
            </p>
          </div>
          <Link to="/" className="text-xs text-[#39ff14] uppercase tracking-[0.2em] border border-[#39ff14]/40 px-6 py-3 hover:bg-[#39ff14]/10 transition-all rounded-sm hidden md:block">
            Return Home
          </Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 relative" onMouseMove={handleMouseMove}>
            <div className="relative w-full max-w-2xl mx-auto">
              <svg viewBox="0 0 612 696" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                {Object.entries(STATE_PATHS)
                  .sort(([a], [b]) => (a === hoveredState ? 1 : b === hoveredState ? -1 : 0))
                  .map(([stateCode, stateData]) => {
                    const question = questionMap.get(stateCode);
                    const hasQuestion = !!question;
                    const fullySolved = question?.solved ?? false;
                    const solveCount = question?.solvedBy.length ?? 0;
                    const fillColor = hasQuestion
                      ? fullySolved ? SOLVED_COLOR : getColorFromScore(question.currentScore, question.maxScore, false)
                      : "#1a1a2e";
                    const isHovered = hoveredState === stateCode;
                    return (
                      <g key={stateCode}>
                        <path
                          d={stateData.d} fill={fillColor}
                          stroke={isHovered ? "#39ff14" : "#0a0a0a"}
                          strokeWidth={isHovered ? 1.5 : 0.3} strokeLinejoin="round"
                          className={hasQuestion ? "cursor-pointer transition-all duration-300 hover:brightness-125" : "cursor-default opacity-50"}
                          onMouseEnter={() => hasQuestion && setHoveredState(stateCode)}
                          onMouseLeave={() => setHoveredState(null)}
                          style={{ transition: "fill 0.5s ease" }}
                        />
                        {fullySolved && hasQuestion && <LeaderboardSolvedBadge pathD={stateData.d} solveCount={solveCount} />}
                      </g>
                    );
                  })}
              </svg>
            </div>
            {hoveredQuestion && hoveredState && (
              <div className="fixed z-50 pointer-events-none" style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}>
                <div className="bg-[#0f0f1a]/95 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-xl shadow-2xl max-w-xs">
                  <p className="text-[#39ff14] text-xs uppercase tracking-widest font-semibold">{hoveredQuestion.stateName}</p>
                  <p className="text-white/50 text-xs mt-1 truncate">{hoveredQuestion.title.slice(0, 80)}...</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/40 text-xs">{hoveredQuestion.currentScore} / {hoveredQuestion.maxScore} pts</span>
                    <span className="text-white/40 text-xs">{hoveredQuestion.solvedBy.length} solve{hoveredQuestion.solvedBy.length !== 1 ? "s" : ""}</span>
                  </div>
                  {hoveredQuestion.solvedBy.length > 0 ? (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                      {hoveredQuestion.solvedBy.map((teamId, i) => {
                        const team = teamMap.get(teamId);
                        return (
                          <div key={teamId} className="flex items-center gap-2 text-xs">
                            <span className="text-[#39ff14] font-bold w-4">#{i + 1}</span>
                            <span className="text-white/70">{team?.name ?? "Unknown"}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs mt-2 pt-2 border-t border-white/10">No teams have solved this yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="lg:w-96">
            <div className="bg-white/[0.02] border border-white/10 rounded-sm backdrop-blur-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-gray-500 font-mono text-xs uppercase tracking-widest font-normal w-16 text-center">Rank</th>
                    <th className="p-4 text-gray-500 font-mono text-xs uppercase tracking-widest font-normal">Team</th>
                    <th className="p-4 text-[#39ff14] font-mono text-xs uppercase tracking-widest font-normal text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-500 font-mono text-sm tracking-widest uppercase">No teams registered yet.</td></tr>
                  ) : sortedTeams.map((team, index) => {
                    const teamSolved = questions.filter((q) => q.solvedBy.includes(team.id)).length;
                    return (
                      <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-center">
                          <span className={`font-mono text-sm ${index === 0 ? "text-[#39ff14] font-bold text-lg" : index === 1 ? "text-yellow-400 font-bold" : index === 2 ? "text-orange-400 font-bold" : "text-gray-400"}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className={`p-4 font-mono uppercase tracking-wider ${index === 0 ? "text-white font-bold" : "text-gray-300"}`}>
                          <div>{team.name}</div>
                          <div className="text-white/30 text-xs normal-case tracking-normal">{teamSolved} solved</div>
                        </td>
                        <td className={`p-4 font-mono text-right ${index === 0 ? "text-[#39ff14] font-bold text-xl" : "text-gray-300"}`}>
                          {team.totalScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function LeaderboardSolvedBadge({ pathD, solveCount }: { pathD: string; solveCount: number }) {
  const coords = pathD.match(/[\d.]+/g)?.map(Number) ?? [];
  let cx = 0, cy = 0, count = 0;
  for (let i = 0; i < coords.length - 1; i += 2) { cx += coords[i]; cy += coords[i + 1]; count++; }
  if (count > 0) { cx /= count; cy /= count; }
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#39ff14" opacity={0.9} />
      <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fontWeight="bold" fill="#0a0a0a">{solveCount}</text>
    </g>
  );
}
