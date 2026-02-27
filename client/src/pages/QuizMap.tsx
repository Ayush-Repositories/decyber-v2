import { useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IndiaMap } from "../components/IndiaMap";
import { ScoreBoard } from "../components/ScoreBoard";
import { useQuizStore, useHasHydrated } from "../store/useQuizStore";

export default function QuizMap() {
  const navigate = useNavigate();
  const questions = useQuizStore((s) => s.questions);
  const teams = useQuizStore((s) => s.teams);
  const loggedInTeamId = useQuizStore((s) => s.loggedInTeamId);
  const logoutTeam = useQuizStore((s) => s.logoutTeam);
  const checkSession = useQuizStore((s) => s.checkSession);
  const gameActive = useQuizStore((s) => s.gameActive);
  const teamsLoaded = useQuizStore((s) => s.teamsLoaded);
  const questionsLoaded = useQuizStore((s) => s.questionsLoaded);
  const hasHydrated = useHasHydrated();

  const loggedInTeam = teams.find((t) => t.id === loggedInTeamId);

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

  const handleStateClick = useCallback(
    (stateCode: string) => {
      if (!gameActive) return;
      const question = questions.find((q) => q.stateCode === stateCode);
      if (question && !question.solved) {
        navigate(`/quiz/${stateCode}`);
      }
    },
    [questions, navigate, gameActive]
  );

  const handleLogout = () => {
    logoutTeam();
    navigate("/quiz/login", { replace: true });
  };

  if (!hasHydrated || !teamsLoaded || !questionsLoaded || !loggedInTeamId) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-neon">DECYBER</span>{" "}
              <span className="text-white/50 font-normal text-lg">India Map Quiz</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              Team: <span className="text-neon font-semibold">{loggedInTeam?.name}</span>
            </span>
            <button onClick={handleLogout} className="text-white/40 hover:text-red-400 text-sm transition-colors">
              Logout
            </button>
            <Link to="/" className="text-white/40 hover:text-white text-sm transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-white/40 text-sm">
                {gameActive
                  ? "Click on a highlighted state to attempt its question. First 5 teams to answer correctly win decreasing points."
                  : "Waiting for the game to start..."}
              </p>
            </div>
            <div className={`transition-opacity ${gameActive ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              <IndiaMap onStateClick={handleStateClick} selectedTeam={loggedInTeamId || undefined} />
            </div>
          </div>
          <div className="lg:w-80 flex flex-col gap-4">
            <ScoreBoard />
          </div>
        </div>
      </main>
    </div>
  );
}
