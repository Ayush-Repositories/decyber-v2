import { useState, useEffect } from "react";
import { useQuizStore } from "../store/useQuizStore";

export function GameTimer({ compact = false }: { compact?: boolean }) {
  const gameActive = useQuizStore((s) => s.gameActive);
  const timerEndsAt = useQuizStore((s) => s.timerEndsAt);
  const serverTimeOffset = useQuizStore((s) => s.serverTimeOffset);

  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!gameActive || !timerEndsAt) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const serverNow = Date.now() + serverTimeOffset;
      const diff = new Date(timerEndsAt).getTime() - serverNow;
      const clamped = Math.max(0, diff);
      setRemaining(clamped);
      if (clamped <= 0) {
        useQuizStore.setState({ gameActive: false });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [gameActive, timerEndsAt, serverTimeOffset]);

  if (!gameActive || remaining <= 0) {
    return (
      <div className={`flex items-center gap-1.5 ${compact ? "" : "px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30"}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span className={`text-red-400 font-medium ${compact ? "text-xs" : "text-sm"}`}>
          {timerEndsAt && remaining <= 0 ? "Time's up!" : "Game not started"}
        </span>
      </div>
    );
  }

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLow = totalSeconds <= 60;

  return (
    <div
      className={`flex items-center gap-1.5 ${
        compact
          ? ""
          : `px-3 py-2 rounded-lg border ${isLow ? "bg-red-500/10 border-red-500/30" : "bg-[#39ff14]/10 border-[#39ff14]/30"}`
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isLow ? "bg-red-500 animate-pulse" : "bg-[#39ff14]"
        }`}
      />
      <span
        className={`font-bold font-mono tabular-nums ${
          compact ? "text-sm" : "text-lg"
        } ${isLow ? "text-red-400" : "text-[#39ff14]"}`}
      >
        {display}
      </span>
    </div>
  );
}
