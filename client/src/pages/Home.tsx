import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.04)_0%,transparent_60%)] pointer-events-none"></div>
      <div className="text-center space-y-6 max-w-3xl relative z-10">
        <h2 className="text-xs md:text-sm tracking-[0.4em] text-gray-500 uppercase font-semibold">
          MACS-DTU Presents
        </h2>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-neon font-mono drop-shadow-md">
          DECYBER
        </h1>
        <p className="text-gray-400 text-base md:text-lg font-light tracking-wide max-w-xl mx-auto">
          Decode the ultimate challenge of intellect and strategy.
        </p>
        <div className="pt-10 flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            to="/quiz/login"
            className="group relative px-8 py-3 bg-transparent border border-[#39ff14]/40 text-[#39ff14] text-sm uppercase tracking-[0.2em] transition-all duration-500 hover:bg-[#39ff14]/10 hover:border-[#39ff14] hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] rounded-sm"
          >
            Team Login
          </Link>
          <Link
            to="/leaderboard"
            className="px-8 py-3 bg-white/5 border border-white/10 text-gray-300 text-sm uppercase tracking-[0.2em] transition-all duration-500 hover:bg-white/10 hover:text-white rounded-sm backdrop-blur-sm"
          >
            Live Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
