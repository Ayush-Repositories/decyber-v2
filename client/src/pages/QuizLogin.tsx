import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuizStore } from "../store/useQuizStore";

export default function QuizLogin() {
  const navigate = useNavigate();
  const loginTeam = useQuizStore((s) => s.loginTeam);

  const [teamName, setTeamName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !passcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loginTeam(teamName, passcode);
      if (result === "success") {
        navigate("/quiz");
      } else if (result === "already_used") {
        setError("ACCESS DENIED: CREDENTIALS ALREADY USED");
        setLoading(false);
      } else {
        setError("ACCESS DENIED: INVALID CREDENTIALS");
        setLoading(false);
      }
    } catch {
      setError("CONNECTION ERROR: PLEASE TRY AGAIN");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-black relative font-mono">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <Link
        to="/"
        className="absolute top-8 left-8 text-[10px] text-gray-500 uppercase tracking-widest hover:text-[#39ff14] transition-colors"
      >
        &larr; Back to Mainframe
      </Link>
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-10 rounded-sm backdrop-blur-md relative z-10">
        <h1 className="text-2xl text-[#39ff14] mb-8 text-center uppercase tracking-[0.2em]">
          System Authentication
        </h1>
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 text-xs uppercase text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2">
              Team Designation
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => { setTeamName(e.target.value); setError(null); }}
              className="w-full bg-black/50 border border-white/10 text-gray-200 px-4 py-3 focus:outline-none focus:border-[#39ff14]/50 transition-all text-sm"
              placeholder="e.g., Alpha"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2">
              Access Passcode
            </label>
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(null); }}
              className="w-full bg-black/50 border border-white/10 text-[#39ff14] px-4 py-3 focus:outline-none focus:border-[#39ff14]/50 transition-all text-sm tracking-widest"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !teamName.trim() || !passcode.trim()}
            className="w-full mt-8 px-8 py-3 bg-transparent border border-[#39ff14]/40 text-[#39ff14] text-xs uppercase tracking-[0.2em] transition-all hover:bg-[#39ff14]/10 hover:border-[#39ff14] rounded-sm disabled:opacity-50 font-bold"
          >
            {loading ? "Establishing Link..." : "Establish Connection"}
          </button>
        </form>
      </div>
    </main>
  );
}
