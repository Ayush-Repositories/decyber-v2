import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as apiService from "../lib/api";

export type Team = {
  id: string;
  name: string;
  totalScore: number;
  loggedIn: boolean;
};

export type Question = {
  id: string;
  stateCode: string;
  stateName: string;
  title: string;
  image: string;
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
  sessionToken: string | null;
  teamsLoaded: boolean;
  questionsLoaded: boolean;

  gameActive: boolean;
  timerEndsAt: string | null;
  timerDurationMinutes: number;
  serverTimeOffset: number;

  // WS state push
  setServerState: (teams: Team[], questions: Question[], gameSettings: GameSettingsWS, serverNow?: number) => void;

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
  submitAnswer: (questionId: string, answer: string) => Promise<"correct" | "wrong" | "already" | "solved" | "inactive" | "retry">;
  resetQuestion: (questionId: string) => Promise<void>;
  updateQuestion: (questionId: string, updates: Partial<Pick<Question, "title" | "image" | "maxScore" | "hint"> & { answer: string }>) => Promise<void>;
  addQuestion: (question: Omit<Question, "currentScore" | "solved" | "solvedBy"> & { answer: string }) => Promise<void>;
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
      sessionToken: null,
      teamsLoaded: false,
      questionsLoaded: false,
      gameActive: false,
      timerEndsAt: null,
      timerDurationMinutes: 30,
      serverTimeOffset: 0,

      setServerState: (teams, questions, gameSettings, serverNow) => {
        let offset = get().serverTimeOffset;
        if (serverNow) {
          offset = serverNow - Date.now();
        }
        const now = Date.now() + offset;
        const active =
          gameSettings.timerRunning &&
          !!gameSettings.timerEndsAt &&
          new Date(gameSettings.timerEndsAt).getTime() > now;
        set({
          teams,
          questions,
          teamsLoaded: true,
          questionsLoaded: true,
          gameActive: active,
          timerEndsAt: gameSettings.timerEndsAt,
          timerDurationMinutes: gameSettings.timerDurationMinutes,
          serverTimeOffset: offset,
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
        const data = await apiService.loginTeam(teamName, passcode);
        if (data.result === "success" && data.team && data.sessionToken) {
          apiService.setSessionToken(data.sessionToken);
          set((s) => ({
            loggedInTeamId: data.team!.id,
            sessionToken: data.sessionToken!,
            teams: s.teams.map((t) => (t.id === data.team!.id ? data.team! : t)),
          }));
        }
        return data.result;
      },

      logoutTeam: () => {
        apiService.setSessionToken(null);
        set({ loggedInTeamId: null, sessionToken: null });
      },

      resetTeamLogin: async (teamId) => {
        await apiService.resetTeamLogin(teamId);
        set((s) => ({
          loggedInTeamId: s.loggedInTeamId === teamId ? null : s.loggedInTeamId,
          sessionToken: s.loggedInTeamId === teamId ? null : s.sessionToken,
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
            apiService.setSessionToken(null);
            set({ loggedInTeamId: null, sessionToken: null });
            return false;
          }
          return true;
        } catch {
          return true;
        }
      },

      submitAnswer: async (questionId, answer) => {
        const result = await apiService.submitAnswer(questionId, answer);
        // Server handles everything; WS broadcast will update state
        return result.result;
      },

      resetQuestion: async (questionId) => {
        await apiService.resetQuestion(questionId, 0);
        // Server handles score deduction and WS broadcast updates state
      },

      updateQuestion: async (questionId, updates) => {
        await apiService.updateQuestion(questionId, updates);
        // WS broadcast will update state
      },

      addQuestion: async (question) => {
        await apiService.addQuestion(question);
        // WS broadcast will update state
      },

      deleteQuestion: async (questionId) => {
        await apiService.deleteQuestion(questionId);
        // WS broadcast will update state
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
        apiService.setSessionToken(null);
        set({ loggedInTeamId: null, sessionToken: null });
      },
    }),
    {
      name: "decyber-quiz-store",
      version: 8,
      migrate() {
        return {
          teams: [],
          questions: [],
          loggedInTeamId: null,
          sessionToken: null,
          teamsLoaded: false,
          questionsLoaded: false,
        } as unknown as QuizState;
      },
      partialize: (state) => ({
        loggedInTeamId: state.loggedInTeamId,
        sessionToken: state.sessionToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.sessionToken) {
          apiService.setSessionToken(state.sessionToken);
        }
      },
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
