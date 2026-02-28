import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import * as apiService from "../lib/api";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function RoundOne() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teamId = searchParams.get("teamId");

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!teamId) return;
    const checkAndFetch = async () => {
      try {
        const checkRes = await fetch(`${BASE}/api/submissions/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, roundNumber: 1 }),
        });
        const checkData = await checkRes.json();
        if (checkData.hasSubmitted) {
          setCompleted(true);
          setLoading(false);
        } else {
          const qRes = await fetch(`${BASE}/api/questions?round=1`);
          const qData = await qRes.json();
          setQuestions(qData);
          setLoading(false);
        }
      } catch { setLoading(false); }
    };
    checkAndFetch();
  }, [teamId]);

  const processSubmission = useCallback(async () => {
    if (!teamId || submitting || completed) return;
    setSubmitting(true);
    const answerData = questions.map((q) => ({
      questionId: q.id,
      submittedAnswer: answers[q.id] || "",
    }));
    try {
      await apiService.submitRoundOne(answerData);
    } catch { /* ignore */ }
    setCompleted(true);
    setSubmitting(false);
  }, [teamId, submitting, completed, questions, answers]);

  useEffect(() => {
    if (timeLeft <= 0 || completed) {
      if (timeLeft <= 0 && !completed) processSubmission();
      return;
    }
    const timerInterval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerInterval);
  }, [timeLeft, completed, processSubmission]);

  if (loading) return <div className="min-h-screen bg-black text-[#39ff14] flex items-center justify-center font-mono">INITIALIZING ENCRYPTION...</div>;

  if (completed) {
    return (
      <div className="min-h-screen bg-black text-center p-8 flex flex-col justify-center items-center font-mono">
        <h1 className="text-2xl text-red-500 mb-4 tracking-widest uppercase">Round 1 Locked</h1>
        <p className="text-gray-500 mb-8 text-xs uppercase">Transmission already received for this team.</p>
        <button onClick={() => navigate(`/dashboard?teamId=${teamId}`)} className="border border-[#39ff14]/30 text-[#39ff14] px-6 py-2 hover:bg-[#39ff14]/5 transition-all text-xs uppercase tracking-widest">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-black relative">
      <div className="fixed top-8 right-8 bg-black border border-[#39ff14]/50 px-6 py-3 z-50 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
        <span className="font-mono text-2xl text-[#39ff14] tracking-tighter">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>
      <div className="max-w-3xl mx-auto pt-10 relative z-10">
        <h1 className="text-3xl font-mono text-[#39ff14] uppercase mb-12 tracking-[0.3em] text-center drop-shadow-md">Round 1 Matrix</h1>
        <form onSubmit={(e) => { e.preventDefault(); processSubmission(); }} className="space-y-12 pb-20">
          {questions.map((q, index) => (
            <div key={q.id} className="border border-white/10 p-8 bg-white/[0.01] backdrop-blur-sm transition-all hover:border-[#39ff14]/30">
              <div className="flex justify-between mb-4">
                <p className="text-[#39ff14] text-xs uppercase font-mono tracking-widest">Query 0{index + 1}</p>
                <p className="text-gray-500 text-xs font-mono">{q.point_value || q.maxScore} PTS</p>
              </div>
              <p className="text-gray-200 text-lg mb-8 font-mono leading-relaxed">{q.question_text || q.title}</p>
              {q.options ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((option: string) => (
                    <label key={option} className={`flex items-center p-4 border transition-all cursor-pointer font-mono text-sm ${answers[q.id] === option ? "border-[#39ff14] bg-[#39ff14]/5 text-[#39ff14]" : "border-white/10 text-gray-500 hover:border-white/20"}`}>
                      <input type="radio" name={q.id} value={option} className="hidden" onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))} />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <input type="text" required onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))} className="w-full bg-black border border-white/10 text-[#39ff14] p-4 focus:outline-none focus:border-[#39ff14]/50 font-mono text-sm" placeholder="Enter solution..." />
              )}
            </div>
          ))}
          <button type="submit" disabled={submitting} className="w-full py-5 bg-transparent border border-[#39ff14]/50 text-[#39ff14] font-bold uppercase tracking-[0.2em] hover:bg-[#39ff14] hover:text-black transition-all disabled:opacity-50">
            {submitting ? "Transmitting..." : "Finalize Round 1"}
          </button>
        </form>
      </div>
    </main>
  );
}
