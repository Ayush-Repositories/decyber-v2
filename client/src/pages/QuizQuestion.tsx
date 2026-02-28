import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore, useHasHydrated } from "../store/useQuizStore";

const MAX_SOLVES = 3;

export default function QuizQuestion() {
  const { stateCode } = useParams<{ stateCode: string }>();
  const navigate = useNavigate();

  const question = useQuizStore((s) =>
    s.questions.find((q) => q.stateCode === stateCode)
  );
  const teams = useQuizStore((s) => s.teams);
  const loggedInTeamId = useQuizStore((s) => s.loggedInTeamId);
  const submitAnswer = useQuizStore((s) => s.submitAnswer);
  const checkSession = useQuizStore((s) => s.checkSession);
  const gameActive = useQuizStore((s) => s.gameActive);
  const teamsLoaded = useQuizStore((s) => s.teamsLoaded);
  const questionsLoaded = useQuizStore((s) => s.questionsLoaded);
  const hasHydrated = useHasHydrated();

  const loggedInTeam = teams.find((t) => t.id === loggedInTeamId);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "already" | "solved" | "inactive" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const penaltyAmount = question ? Math.round(question.maxScore * 0.1) : 0;

  useEffect(() => {
    if (hasHydrated && !loggedInTeamId) {
      navigate("/quiz/login", { replace: true });
    }
  }, [hasHydrated, loggedInTeamId, navigate]);

  useEffect(() => {
    if (!hasHydrated || !loggedInTeamId) return;
    const interval = setInterval(async () => {
      const valid = await checkSession();
      if (!valid) navigate("/quiz/login", { replace: true });
    }, 10_000);
    return () => clearInterval(interval);
  }, [hasHydrated, loggedInTeamId, checkSession, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!question || !answer.trim() || !loggedInTeamId || question.solved || !gameActive || submitting) return;
    setSubmitting(true);
    try {
      const result = await submitAnswer(question.id, answer);
      if (result === "retry") {
        // Race condition — retry once
        const retryResult = await submitAnswer(question.id, answer);
        setFeedback(retryResult === "retry" ? "wrong" : retryResult as any);
      } else {
        setFeedback(result as any);
      }
      if (result !== "correct") {
        setTimeout(() => setFeedback(null), 1500);
      }
    } catch {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1500);
    } finally {
      setSubmitting(false);
    }
  }, [answer, loggedInTeamId, question, submitAnswer, gameActive, submitting]);

  if (!hasHydrated || !teamsLoaded || !questionsLoaded || !loggedInTeamId) return null;

  if (!question) {
    navigate("/quiz", { replace: true });
    return null;
  }

  const solveCount = question.solvedBy.length;
  const scorePercent = question.maxScore > 0 ? (question.currentScore / question.maxScore) * 100 : 0;

  const solverTeams = question.solvedBy.map((teamId, i) => {
    const team = teams.find((t) => t.id === teamId);
    return { name: team?.name ?? "Unknown", position: i + 1 };
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/quiz")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to Map
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              Team: <span className="text-neon font-semibold">{loggedInTeam?.name}</span>
            </span>
            <h1 className="text-xl font-bold"><span className="text-neon">DECYBER</span></h1>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-3">
              <span className="text-xs uppercase tracking-widest text-[#39ff14]/80">{question.stateName}</span>
            </div>
            {question.stateCode === "IN-TN" && (
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                <img src="/images/tamilnadu.jpg" alt="Integral" className="w-full h-full object-contain bg-[#0a0a0a]" />
              </div>
            )}
          </div>
          <div className="lg:w-[420px] flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">{question.title}</h2>
            <div className="w-full h-2.5 bg-white/10 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: scorePercent > 50 ? "#39ff14" : scorePercent > 20 ? "#ffaa00" : "#ff3333",
                }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-white/60">{solveCount}/{MAX_SOLVES} solved</span>
              <span className="text-3xl font-bold text-[#39ff14]">
                {question.currentScore} pts
              </span>
            </div>
            {solverTeams.length > 0 && (
              <div className="mb-6 space-y-1.5">
                {solverTeams.map((s) => (
                  <div key={s.position} className="flex items-center gap-2 text-sm">
                    <span className="text-[#39ff14] font-bold w-5">#{s.position}</span>
                    <span className="text-white/70">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
            {question.solved ? (
              <motion.div className="text-center py-12 flex-1 flex flex-col items-center justify-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-5xl mb-4">&#127942;</div>
                <p className="text-white/50 text-lg font-medium">All {MAX_SOLVES} teams have solved this!</p>
                <p className="text-white/30 text-sm mt-2">No more points available</p>
                <button onClick={() => navigate("/quiz")} className="mt-8 px-8 py-3 rounded-lg font-semibold bg-white/10 text-white hover:bg-white/20 transition-all">
                  Return to Map
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/40 mb-1.5">Answer</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#39ff14]/50 transition-colors"
                    autoFocus
                    disabled={submitting}
                  />
                </div>
                <AnimatePresence>
                  {feedback === "wrong" && (
                    <motion.p className="text-red-400 text-sm text-center" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      Wrong answer! -{penaltyAmount} pts
                    </motion.p>
                  )}
                  {feedback === "already" && (
                    <motion.p className="text-yellow-400 text-sm text-center" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      Your team already solved this question!
                    </motion.p>
                  )}
                  {feedback === "correct" && (
                    <motion.p className="text-[#39ff14] text-sm text-center font-semibold" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      Correct!
                    </motion.p>
                  )}
                </AnimatePresence>
                {!gameActive && (
                  <p className="text-red-400 text-sm text-center font-medium">
                    Game has not started yet or time's up!
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || !gameActive || submitting}
                  className="w-full py-3 rounded-lg font-semibold text-lg bg-[#39ff14] text-[#0a0a0a] hover:bg-[#39ff14]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? "Submitting..." : "Submit Answer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
