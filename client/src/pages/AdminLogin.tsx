import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE}/api/game/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem("decyber-admin-auth", "true");
        navigate("/admin");
      } else {
        setError("ACCESS DENIED: INVALID ADMIN KEY");
        setLoading(false);
      }
    } catch {
      setError("CONNECTION ERROR: UNABLE TO REACH SERVER");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-black relative font-mono">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,50,50,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      <Link
        to="/"
        className="absolute top-8 left-8 text-[10px] text-gray-500 uppercase tracking-widest hover:text-red-400 transition-colors"
      >
        &larr; Back to Mainframe
      </Link>
      <div className="w-full max-w-md bg-white/[0.02] border border-red-500/20 p-10 rounded-sm backdrop-blur-md relative z-10">
        <h1 className="text-2xl text-red-400 mb-2 text-center uppercase tracking-[0.2em]">
          Admin Access
        </h1>
        <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-8">
          Restricted Zone
        </p>
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 text-xs uppercase text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-500 text-[10px] uppercase tracking-widest mb-2">
              Admin Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className="w-full bg-black/50 border border-white/10 text-red-400 px-4 py-3 focus:outline-none focus:border-red-500/50 transition-all text-sm tracking-widest"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full mt-8 px-8 py-3 bg-transparent border border-red-500/40 text-red-400 text-xs uppercase tracking-[0.2em] transition-all hover:bg-red-500/10 hover:border-red-500 rounded-sm disabled:opacity-50 font-bold"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>
      </div>
    </main>
  );
}
