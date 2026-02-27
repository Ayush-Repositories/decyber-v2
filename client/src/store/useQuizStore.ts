import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { scoreForNthSolve, nextSolveScore, isFullySolved } from "../lib/timer";
import * as apiService from "../lib/api";

export type Team = {
  id: string;
  name: string;
  totalScore: number;
  passcode: string;
  loggedIn: boolean;
};

export type Question = {
  id: string;
  stateCode: string;
  stateName: string;
  title: string;
  image: string;
  answer: string;
  hint: string;
  maxScore: number;
  currentScore: number;
  solved: boolean;
  solvedBy: string[];
};

type GameSettingsWS = {
  timerRunning: boolean;
  timerEndsAt: string | null;
  timerDurationMinutes: number;
};

type QuizState = {
  teams: Team[];
  questions: Question[];
  loggedInTeamId: string | null;
  teamsLoaded: boolean;
  questionsLoaded: boolean;

  gameActive: boolean;
  timerEndsAt: string | null;
  timerDurationMinutes: number;
  serverTimeOffset: number;

  // WS state push
  setServerState: (teams: Team[], questions: Question[], gameSettings: GameSettingsWS) => void;

  // Team actions
  fetchTeams: () => Promise<void>;
  addTeam: (name: string, passcode: string) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;

  // Auth
  loginTeam: (teamName: string, passcode: string) => Promise<"success" | "invalid" | "already_used">;
  logoutTeam: () => void;
  resetTeamLogin: (teamId: string) => Promise<void>;
  checkSession: () => Promise<boolean>;

  // Questions
  fetchQuestions: () => Promise<void>;
  submitAnswer: (questionId: string, teamId: string, answer: string) => "correct" | "wrong" | "already" | "solved" | "inactive";
  resetQuestion: (questionId: string) => Promise<void>;
  updateQuestion: (questionId: string, updates: Partial<Pick<Question, "title" | "answer" | "image" | "maxScore" | "hint">>) => Promise<void>;
  addQuestion: (question: Omit<Question, "currentScore" | "solved" | "solvedBy">) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;

  // Game timer
  fetchGameSettings: () => Promise<void>;
  startGame: (durationMinutes: number) => Promise<void>;
  stopGame: () => Promise<void>;

  resetGame: () => void;
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      teams: [],
      questions: [],
      loggedInTeamId: null,
      teamsLoaded: false,
      questionsLoaded: false,
      gameActive: false,
      timerEndsAt: null,
      timerDurationMinutes: 30,
      serverTimeOffset: 0,

      setServerState: (teams, questions, gameSettings) => {
        const offset = get().serverTimeOffset;
        const serverNow = Date.now() + offset;
        const active =
          gameSettings.timerRunning &&
          !!gameSettings.timerEndsAt &&
          new Date(gameSettings.timerEndsAt).getTime() > serverNow;
        set({
          teams,
          questions,
          teamsLoaded: true,
          questionsLoaded: true,
          gameActive: active,
          timerEndsAt: gameSettings.timerEndsAt,
          timerDurationMinutes: gameSettings.timerDurationMinutes,
        });
      },

      fetchTeams: async () => {
        try {
          const teams = await apiService.fetchAllTeams();
          set({ teams, teamsLoaded: true });
        } catch (err) {
          console.error("Failed to fetch teams:", err);
          set({ teamsLoaded: true });
        }
      },

      fetchQuestions: async () => {
        try {
          const questions = await apiService.fetchAllQuestions();
          set({ questions, questionsLoaded: true });
        } catch (err) {
          console.error("Failed to fetch questions:", err);
          set({ questionsLoaded: true });
        }
      },

      addTeam: async (name, passcode) => {
        const created = await apiService.addTeam(name, passcode);
        set((s) => ({ teams: [...s.teams, created] }));
      },

      removeTeam: async (id) => {
        await apiService.removeTeam(id);
        set((s) => ({
          teams: s.teams.filter((t) => t.id !== id),
          loggedInTeamId: s.loggedInTeamId === id ? null : s.loggedInTeamId,
        }));
      },

      loginTeam: async (teamName, passcode) => {
        const { result, team } = await apiService.loginTeam(teamName, passcode);
        if (result === "success" && team) {
          set((s) => ({
            loggedInTeamId: team.id,
            teams: s.teams.map((t) => (t.id === team.id ? team : t)),
          }));
        }
        return result;
      },

      logoutTeam: () => {
        set({ loggedInTeamId: null });
      },

      resetTeamLogin: async (teamId) => {
        await apiService.resetTeamLogin(teamId);
        set((s) => ({
          loggedInTeamId: s.loggedInTeamId === teamId ? null : s.loggedInTeamId,
          teams: s.teams.map((t) =>
            t.id === teamId ? { ...t, loggedIn: false } : t
          ),
        }));
      },

      checkSession: async () => {
        const { loggedInTeamId } = get();
        if (!loggedInTeamId) return false;
        try {
          const { exists, loggedIn } = await apiService.checkTeamStatus(loggedInTeamId);
          if (!exists || !loggedIn) {
            set({ loggedInTeamId: null });
            return false;
          }
          return true;
        } catch {
          return true;
        }
      },

      submitAnswer: (questionId, teamId, answer) => {
        const state = get();
        if (!state.gameActive) return "inactive";
        const question = state.questions.find((q) => q.id === questionId);
        if (!question) return "solved";
        if (question.solved) return "solved";
        if (question.solvedBy.includes(teamId)) return "already";

        const normalized = answer.trim();
        const stored = question.answer;

        let isCorrect = false;
        if (stored.startsWith("!reject:")) {
          const rejected = stored.slice(8).split("|").map((s) => s.toLowerCase());
          isCorrect = normalized.length > 0 && !rejected.includes(normalized.toLowerCase());
        } else if (stored.includes("|")) {
          isCorrect = stored.split("|").some((a) => a === normalized);
        } else {
          isCorrect = normalized === stored;
        }

        if (!isCorrect) {
          const penalty = Math.round(question.maxScore * 0.1);
          const team = state.teams.find((t) => t.id === teamId);
          if (team && penalty > 0) {
            const newTotalScore = Math.max(0, team.totalScore - penalty);
            set((s) => ({
              teams: s.teams.map((t) =>
                t.id === teamId ? { ...t, totalScore: newTotalScore } : t
              ),
            }));
            apiService.updateTeamScore(teamId, newTotalScore).catch(console.error);
          }
          return "wrong";
        }

        const earnedScore = scoreForNthSolve(question.maxScore, question.solvedBy.length);
        const newSolvedBy = [...question.solvedBy, teamId];
        const newCurrentScore = nextSolveScore(question.maxScore, newSolvedBy.length);
        const newSolved = isFullySolved(newSolvedBy.length);

        const team = state.teams.find((t) => t.id === teamId);
        const newTotalScore = (team?.totalScore ?? 0) + earnedScore;

        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === questionId
              ? { ...q, solvedBy: newSolvedBy, currentScore: newCurrentScore, solved: newSolved }
              : q
          ),
          teams: s.teams.map((t) =>
            t.id === teamId ? { ...t, totalScore: t.totalScore + earnedScore } : t
          ),
        }));

        apiService.updateTeamScore(teamId, newTotalScore).catch(console.error);
        apiService.submitQuestionAnswer(questionId, newSolvedBy, newCurrentScore, newSolved).catch(console.error);

        return "correct";
      },

      resetQuestion: async (questionId) => {
        const state = get();
        const question = state.questions.find((q) => q.id === questionId);
        if (!question) return;

        const scoreByTeam = new Map<string, number>();
        question.solvedBy.forEach((teamId, index) => {
          const earned = scoreForNthSolve(question.maxScore, index);
          scoreByTeam.set(teamId, (scoreByTeam.get(teamId) ?? 0) + earned);
        });

        const updatedTeams = state.teams.map((t) => {
          const deduct = scoreByTeam.get(t.id) ?? 0;
          return deduct > 0 ? { ...t, totalScore: Math.max(0, t.totalScore - deduct) } : t;
        });

        set({
          teams: updatedTeams,
          questions: state.questions.map((q) =>
            q.id === questionId ? { ...q, solved: false, solvedBy: [], currentScore: q.maxScore } : q
          ),
        });

        await apiService.resetQuestion(questionId, question.maxScore);
        for (const [teamId, deduct] of scoreByTeam) {
          if (deduct > 0) {
            const team = updatedTeams.find((t) => t.id === teamId);
            if (team) apiService.updateTeamScore(teamId, team.totalScore).catch(console.error);
          }
        }
      },

      updateQuestion: async (questionId, updates) => {
        await apiService.updateQuestion(questionId, updates);
        set((state) => ({
          questions: state.questions.map((q) =>
            q.id === questionId
              ? { ...q, ...updates, currentScore: updates.maxScore !== undefined ? updates.maxScore : q.currentScore }
              : q
          ),
        }));
      },

      addQuestion: async (question) => {
        const created = await apiService.addQuestion(question);
        set((state) => ({ questions: [...state.questions, created] }));
      },

      deleteQuestion: async (questionId) => {
        await apiService.deleteQuestion(questionId);
        set((state) => ({ questions: state.questions.filter((q) => q.id !== questionId) }));
      },

      fetchGameSettings: async () => {
        try {
          const settings = await apiService.fetchGameSettings();
          const offset = settings.serverNow - Date.now();
          const serverNow = Date.now() + offset;
          const active =
            settings.timerRunning &&
            !!settings.timerEndsAt &&
            new Date(settings.timerEndsAt).getTime() > serverNow;
          set({
            gameActive: active,
            timerEndsAt: settings.timerEndsAt,
            timerDurationMinutes: settings.timerDurationMinutes,
            serverTimeOffset: offset,
          });
        } catch (err) {
          console.error("Failed to fetch game settings:", err);
        }
      },

      startGame: async (durationMinutes) => {
        await apiService.startGameTimer(durationMinutes);
        const settings = await apiService.fetchGameSettings();
        const offset = settings.serverNow - Date.now();
        set({
          gameActive: true,
          timerEndsAt: settings.timerEndsAt,
          timerDurationMinutes: settings.timerDurationMinutes,
          serverTimeOffset: offset,
        });
      },

      stopGame: async () => {
        await apiService.stopGameTimer();
        set({ gameActive: false, timerEndsAt: null });
        const settings = await apiService.fetchGameSettings();
        const offset = settings.serverNow - Date.now();
        set({ serverTimeOffset: offset });
      },

      resetGame: () => {
        set({ loggedInTeamId: null });
      },
    }),
    {
      name: "decyber-quiz-store",
      version: 7,
      migrate() {
        return {
          teams: [],
          questions: [],
          loggedInTeamId: null,
          teamsLoaded: false,
          questionsLoaded: false,
        } as unknown as QuizState;
      },
      partialize: (state) => ({
        loggedInTeamId: state.loggedInTeamId,
      }),
    }
  )
);

export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useQuizStore.persist.onFinishHydration(() => setHydrated(true));
    if (useQuizStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
