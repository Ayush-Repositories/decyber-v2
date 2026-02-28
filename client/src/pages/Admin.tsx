import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizStore, type Question } from "../store/useQuizStore";
import { GameTimer } from "../components/GameTimer";
import * as apiService from "../lib/api";

type AdminQuestion = Question & { answer: string };

export default function Admin() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("decyber-admin-token");
    if (token) {
      apiService.setAdminToken(token);
      setAuthorized(true);
    } else {
      navigate("/admin/login", { replace: true });
    }
    setChecked(true);
  }, [navigate]);

  if (!checked || !authorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  return <AdminContent />;
}

function AdminContent() {
  const navigate = useNavigate();

  const teams = useQuizStore((s) => s.teams);
  const addTeam = useQuizStore((s) => s.addTeam);
  const removeTeam = useQuizStore((s) => s.removeTeam);
  const resetQuestion = useQuizStore((s) => s.resetQuestion);
  const resetTeamLogin = useQuizStore((s) => s.resetTeamLogin);
  const updateQuestion = useQuizStore((s) => s.updateQuestion);
  const addQuestion = useQuizStore((s) => s.addQuestion);
  const deleteQuestion = useQuizStore((s) => s.deleteQuestion);
  const gameActive = useQuizStore((s) => s.gameActive);
  const startGame = useQuizStore((s) => s.startGame);
  const stopGame = useQuizStore((s) => s.stopGame);

  // Admin questions (with answers) fetched separately
  const [adminQuestions, setAdminQuestions] = useState<AdminQuestion[]>([]);

  const fetchAdminQs = async () => {
    try {
      const qs = await apiService.fetchAdminQuestions();
      setAdminQuestions(qs);
    } catch (err) {
      console.error("Failed to fetch admin questions:", err);
    }
  };

  useEffect(() => {
    fetchAdminQs();
  }, []);

  // Re-fetch admin questions when store questions change (WS broadcast)
  const storeQuestions = useQuizStore((s) => s.questions);
  useEffect(() => {
    fetchAdminQs();
  }, [storeQuestions]);

  const [timerDuration, setTimerDuration] = useState(30);
  const [timerLoading, setTimerLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPasscode, setNewTeamPasscode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", answer: "", image: "", maxScore: 0, hint: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());
  const [newQuestion, setNewQuestion] = useState({
    id: "", stateCode: "", stateName: "", title: "", image: "", answer: "", hint: "", maxScore: 100,
  });

  const handleLogout = () => {
    sessionStorage.removeItem("decyber-admin-token");
    apiService.setAdminToken(null);
    navigate("/admin/login", { replace: true });
  };

  const handleAddTeam = async () => {
    const name = newTeamName.trim();
    const passcode = newTeamPasscode.trim();
    if (!name || !passcode) return;
    setTeamError(null);
    try {
      await addTeam(name, passcode);
      setNewTeamName("");
      setNewTeamPasscode("");
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : "Failed to add team");
    }
  };

  const handleRemoveTeam = async (id: string) => {
    setTeamError(null);
    try { await removeTeam(id); } catch (err) {
      setTeamError(err instanceof Error ? err.message : "Failed to remove team");
    }
  };

  const handleResetLogin = async (teamId: string) => {
    setTeamError(null);
    try { await resetTeamLogin(teamId); } catch (err) {
      setTeamError(err instanceof Error ? err.message : "Failed to reset login");
    }
  };

  const startEditing = (q: AdminQuestion) => {
    setEditingId(q.id);
    setEditForm({ title: q.title, answer: q.answer, image: q.image, maxScore: q.maxScore, hint: q.hint });
  };

  const saveEdit = async (questionId: string) => {
    setQuestionError(null);
    try { await updateQuestion(questionId, editForm); setEditingId(null); } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Failed to update question");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.id.trim() || !newQuestion.title.trim()) return;
    setQuestionError(null);
    try {
      await addQuestion(newQuestion);
      setNewQuestion({ id: "", stateCode: "", stateName: "", title: "", image: "", answer: "", hint: "", maxScore: 100 });
      setShowAddForm(false);
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Failed to add question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setQuestionError(null);
    try { await deleteQuestion(questionId); } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Failed to delete question");
    }
  };

  const handleResetQuestion = async (questionId: string) => {
    setQuestionError(null);
    try { await resetQuestion(questionId); } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Failed to reset question");
    }
  };

  const toggleHint = (id: string) => {
    setExpandedHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#39ff14]/50";
  const labelClass = "text-xs text-white/40 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-neon">DECYBER</span>{" "}
            <span className="text-white/50 font-normal text-lg">Admin Panel</span>
          </h1>
          <div className="flex items-center gap-4">
            <a href="/quiz" className="text-white/40 hover:text-white text-sm transition-colors">Back to Quiz</a>
            <button onClick={handleLogout} className="text-red-400/60 hover:text-red-400 text-sm transition-colors">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Game Timer Control */}
        <section className="rounded-2xl border border-white/10 bg-[#0f0f1a]/80 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Game Timer</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <GameTimer />
            {!gameActive ? (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-white/50">Duration (min):</label>
                  <input type="number" min={1} value={timerDuration} onChange={(e) => setTimerDuration(Number(e.target.value))} className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#39ff14]/50" />
                </div>
                <button onClick={async () => { setTimerLoading(true); try { await startGame(timerDuration); } finally { setTimerLoading(false); } }} disabled={timerLoading || timerDuration < 1} className="px-4 py-2 bg-[#39ff14] text-[#0a0a0a] rounded-lg text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#39ff14]/90 transition-all">
                  Start Game
                </button>
              </>
            ) : (
              <button onClick={async () => { setTimerLoading(true); try { await stopGame(); } finally { setTimerLoading(false); } }} disabled={timerLoading} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500/90 transition-all">
                Stop Game
              </button>
            )}
          </div>
        </section>

        {/* Team Management */}
        <section className="rounded-2xl border border-white/10 bg-[#0f0f1a]/80 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Team Management</h2>
          {teamError && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs uppercase text-center rounded-lg">{teamError}</div>}
          <div className="flex gap-2 mb-4">
            <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTeam()} placeholder="Team name" className={inputClass + " flex-1"} />
            <input type="text" value={newTeamPasscode} onChange={(e) => setNewTeamPasscode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTeam()} placeholder="Passcode" className={inputClass + " flex-1"} />
            <button onClick={handleAddTeam} disabled={!newTeamName.trim() || !newTeamPasscode.trim()} className="px-4 py-2 bg-[#39ff14] text-[#0a0a0a] rounded-lg text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#39ff14]/90 transition-all">Add</button>
          </div>
          {teams.length > 0 && (
            <div className="space-y-1">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm">{team.name} <span className="text-white/40 text-xs">({team.totalScore} pts)</span></span>
                    <div className="text-xs text-white/30 mt-0.5">
                      {team.loggedIn ? <span className="text-yellow-400">Logged in</span> : <span className="text-white/30">Not logged in</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {team.loggedIn && <button onClick={() => handleResetLogin(team.id)} className="text-yellow-400/60 hover:text-yellow-400 text-xs transition-colors">Reset Login</button>}
                    <button onClick={() => handleRemoveTeam(team.id)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Question Management */}
        <section className="rounded-2xl border border-white/10 bg-[#0f0f1a]/80 backdrop-blur-xl p-6">
          {questionError && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs uppercase text-center rounded-lg">{questionError}</div>}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Question Management</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="px-3 py-1.5 bg-[#39ff14] text-[#0a0a0a] rounded-lg text-sm font-semibold hover:bg-[#39ff14]/90 transition-all">
              {showAddForm ? "Cancel" : "+ Add Question"}
            </button>
          </div>
          {showAddForm && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-sm font-medium text-white/70">New Question</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>ID</label><input className={inputClass} placeholder="q-XX" value={newQuestion.id} onChange={(e) => setNewQuestion({ ...newQuestion, id: e.target.value })} /></div>
                <div><label className={labelClass}>State Code</label><input className={inputClass} placeholder="IN-XX" value={newQuestion.stateCode} onChange={(e) => setNewQuestion({ ...newQuestion, stateCode: e.target.value })} /></div>
                <div className="col-span-2"><label className={labelClass}>State Name</label><input className={inputClass} placeholder="State Name" value={newQuestion.stateName} onChange={(e) => setNewQuestion({ ...newQuestion, stateName: e.target.value })} /></div>
                <div className="col-span-2"><label className={labelClass}>Title</label><input className={inputClass} placeholder="Question text" value={newQuestion.title} onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })} /></div>
                <div><label className={labelClass}>Answer</label><input className={inputClass} placeholder="answer" value={newQuestion.answer} onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })} /></div>
                <div><label className={labelClass}>Hint</label><input className={inputClass} placeholder="Optional hint" value={newQuestion.hint} onChange={(e) => setNewQuestion({ ...newQuestion, hint: e.target.value })} /></div>
                <div><label className={labelClass}>Image Path</label><input className={inputClass} placeholder="/images/xxx.jpg" value={newQuestion.image} onChange={(e) => setNewQuestion({ ...newQuestion, image: e.target.value })} /></div>
                <div><label className={labelClass}>Max Score</label><input type="number" className={inputClass} value={newQuestion.maxScore} onChange={(e) => setNewQuestion({ ...newQuestion, maxScore: Number(e.target.value) })} /></div>
              </div>
              <button onClick={handleAddQuestion} disabled={!newQuestion.id.trim() || !newQuestion.title.trim()} className="px-4 py-2 bg-[#39ff14] text-[#0a0a0a] rounded-lg text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#39ff14]/90 transition-all">Add Question</button>
            </div>
          )}
          <div className="space-y-2">
            {adminQuestions.map((q) => (
              <div key={q.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
                {editingId === q.id ? (
                  <div className="space-y-3">
                    <div><label className={labelClass}>Title</label><input className={inputClass} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelClass}>Answer</label><input className={inputClass} value={editForm.answer} onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })} /></div>
                      <div><label className={labelClass}>Hint</label><input className={inputClass} value={editForm.hint} onChange={(e) => setEditForm({ ...editForm, hint: e.target.value })} /></div>
                      <div><label className={labelClass}>Image</label><input className={inputClass} value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} /></div>
                      <div><label className={labelClass}>Max Score</label><input type="number" className={inputClass} value={editForm.maxScore} onChange={(e) => setEditForm({ ...editForm, maxScore: Number(e.target.value) })} /></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(q.id)} className="px-3 py-1.5 bg-[#39ff14] text-[#0a0a0a] rounded-lg text-xs font-semibold hover:bg-[#39ff14]/90 transition-all">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-white/10 text-white/70 rounded-lg text-xs hover:bg-white/20 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{q.stateName}</p>
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{q.title}</p>
                        <p className="text-xs text-white/30 mt-0.5">
                          Answer: <span className="text-white/50 font-mono">{q.answer}</span> &middot; Max: {q.maxScore} pts
                          {q.solvedBy.length > 0 && <span className="text-[#39ff14] ml-2">{q.solvedBy.length} solve{q.solvedBy.length !== 1 ? "s" : ""}</span>}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {q.hint && <button onClick={() => toggleHint(q.id)} className={`px-2 py-1 text-xs transition-colors ${expandedHints.has(q.id) ? "text-purple-400" : "text-purple-400/50 hover:text-purple-400"}`}>Hint</button>}
                        <button onClick={() => startEditing(q)} className="px-2 py-1 text-xs text-blue-400/70 hover:text-blue-400 transition-colors">Edit</button>
                        <button onClick={() => handleResetQuestion(q.id)} className="px-2 py-1 text-xs text-yellow-400/70 hover:text-yellow-400 transition-colors">Reset</button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="px-2 py-1 text-xs text-red-400/70 hover:text-red-400 transition-colors">Delete</button>
                      </div>
                    </div>
                    {expandedHints.has(q.id) && q.hint && (
                      <div className="mt-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-xs text-purple-300">{q.hint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
