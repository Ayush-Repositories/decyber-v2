import { useMemo } from "react";
import { useQuizStore } from "../store/useQuizStore";

export function ScoreBoard() {
  const teams = useQuizStore((s) => s.teams);
  const questions = useQuizStore((s) => s.questions);
  const loggedInTeamId = useQuizStore((s) => s.loggedInTeamId);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => b.totalScore - a.totalScore),
    [teams]
  );

  const solvedCount = questions.filter((q) => q.solved).length;
  const totalCount = questions.length;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f1a]/80 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
        <span className="text-xs text-white/40">
          {solvedCount}/{totalCount} solved
        </span>
      </div>

      <div className="space-y-2">
        {sortedTeams.map((team, index) => {
          const teamSolved = questions.filter(
            (q) => q.solvedBy.includes(team.id)
          ).length;
          const isLoggedIn = team.id === loggedInTeamId;

          return (
            <div
              key={team.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isLoggedIn
                  ? "bg-[#39ff14]/10 border border-[#39ff14]/30"
                  : "bg-white/5 border border-transparent"
              }`}
            >
              <span
                className={`text-sm font-bold w-6 text-center ${
                  index === 0
                    ? "text-[#39ff14]"
                    : index === 1
                    ? "text-yellow-400"
                    : index === 2
                    ? "text-orange-400"
                    : "text-white/40"
                }`}
              >
                #{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {team.name}
                </p>
                <p className="text-white/30 text-xs">
                  {teamSolved} solved
                </p>
              </div>
              <span
                className={`text-lg font-bold tabular-nums ${
                  isLoggedIn ? "text-[#39ff14]" : "text-white"
                }`}
              >
                {team.totalScore}
              </span>
            </div>
          );
        })}
      </div>

      {sortedTeams.length === 0 && (
        <p className="text-center text-white/30 text-sm py-4">
          No teams yet. Add teams from the admin panel.
        </p>
      )}
    </div>
  );
}
