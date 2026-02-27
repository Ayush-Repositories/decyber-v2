import { useEffect } from "react";
import { GameTimer } from "./GameTimer";
import { connectWS } from "../lib/ws";
import { useQuizStore } from "../store/useQuizStore";

export function GlobalTimer() {
  useEffect(() => {
    // Fetch game settings for server time offset, then connect WS
    useQuizStore.getState().fetchGameSettings();
    connectWS();
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/5 flex items-center justify-center py-1">
      <GameTimer compact />
    </div>
  );
}
