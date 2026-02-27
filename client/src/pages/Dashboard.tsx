import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teamId = searchParams.get("teamId");

  const [teamData, setTeamData] = useState<{ team_name: string; total_score: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) { navigate("/login"); return; }
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${BASE}/api/teams/${teamId}`);
        if (res.ok) {
          const data = await res.json();
          setTeamData({ team_name: data.name, total_score: data.totalScore });
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchTeam();
  }, [teamId, navigate]);

  const handleLogout = () => navigate("/");

  if (loading) return <div className="min-h-screen bg-black text-[#39ff14] flex items-center justify-center font-mono animate-pulse">SYNCING DATA...</div>;
  if (!teamData) return null;

  return (
    <main className="min-h-screen p-8 bg-black relative font-mono">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#39ff14]/30 pb-6 gap-6">
          <div>
            <h2 className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-1">Active Session</h2>
            <h1 className="text-4xl md:text-6xl text-white uppercase tracking-tighter font-bold mb-2">{teamData.team_name}</h1>
            <button onClick={handleLogout} className="text-[10px] text-red-500/70 hover:text-red-500 uppercase tracking-[0.2em] border border-red-500/30 px-3 py-1 transition-all hover:bg-red-500/10">
              Terminate Session [Logout]
            </button>
          </div>
          <div className="md:text-right bg-[#39ff14]/5 border border-[#39ff14]/20 px-8 py-4 rounded-sm">
            <h2 className="text-[#39ff14] text-xs uppercase tracking-[0.3em] mb-1">Current Score</h2>
            <p className="text-5xl text-white font-bold">{teamData.total_score}</p>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="border border-white/10 p-8 bg-white/[0.02] backdrop-blur-sm group hover:border-[#39ff14]/40 transition-all">
            <h3 className="text-xl text-white mb-4 uppercase tracking-widest">Round 1</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">DeCyber Quiz Extravaganza. Multi-choice and text-based security analysis.</p>
            <Link to={`/rounds/1?teamId=${teamId}`} className="block w-full text-center py-3 border border-[#39ff14]/40 text-[#39ff14] text-xs uppercase tracking-widest hover:bg-[#39ff14] hover:text-black transition-all">
              Initialize Round
            </Link>
          </div>
          <div className="border border-white/5 p-8 bg-white/[0.01] opacity-60">
            <h3 className="text-xl text-gray-500 mb-4 uppercase tracking-widest">Round 2</h3>
            <p className="text-gray-600 text-sm mb-8 italic">Multimedia Challenge Locked.</p>
            <div className="py-3 border border-white/10 text-gray-600 text-xs text-center uppercase tracking-widest">Awaiting Clearance</div>
          </div>
        </div>
      </div>
    </main>
  );
}
