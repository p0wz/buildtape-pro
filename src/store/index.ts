/**
 * BuildTape Pro — Global Zustand Store
 */

import { create } from "zustand";
import { TapeEntry } from "../features/calculator/CalculatorEngine";
import { Length } from "../lib/length";
import type { PrecisionDenominator } from "../lib/length";
import type { DisplayMode } from "../lib/formatting";

export interface Job {
  id: string;
  name: string;
  notes: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  // Pro status
  isPro: boolean;
  setIsPro: (val: boolean) => void;

  // Settings
  precision: PrecisionDenominator;
  setPrecision: (p: PrecisionDenominator) => void;
  displayMode: DisplayMode;
  setDisplayMode: (m: DisplayMode) => void;

  // Tape history (in-memory + backed by SQLite)
  tapeEntries: TapeEntry[];
  addTapeEntry: (entry: TapeEntry) => void;
  removeTapeEntry: (id: string) => void;
  clearTape: () => void;
  setTapeEntries: (entries: TapeEntry[]) => void;
  assignEntryToJob: (entryId: string, jobId: string | null) => void;

  // Jobs
  jobs: Job[];
  addJob: (job: Job) => void;
  updateJob: (id: string, name: string, notes: string, photos: string[]) => void;
  removeJob: (id: string) => void;
  setJobs: (jobs: Job[]) => void;

  // DB initialized flag
  dbReady: boolean;
  setDbReady: (ready: boolean) => void;
}

// Limits for free tier
export const FREE_TAPE_LIMIT = 10;
export const FREE_JOB_LIMIT = 3;

export const useStore = create<AppState>((set) => ({
  isPro: false,
  setIsPro: (val) => set({ isPro: val }),

  precision: 16,
  setPrecision: (p) => set({ precision: p }),
  displayMode: "fraction",
  setDisplayMode: (m) => set({ displayMode: m }),

  tapeEntries: [],
  addTapeEntry: (entry) =>
    set((state) => ({
      tapeEntries: [entry, ...state.tapeEntries],
    })),
  removeTapeEntry: (id) =>
    set((state) => ({
      tapeEntries: state.tapeEntries.filter((e) => e.id !== id),
    })),
  clearTape: () => set({ tapeEntries: [] }),
  setTapeEntries: (entries) => set({ tapeEntries: entries }),
  assignEntryToJob: (entryId, jobId) =>
    set((state) => ({
      tapeEntries: state.tapeEntries.map((e) =>
        e.id === entryId ? { ...e, jobId } : e,
      ),
    })),

  jobs: [],
  addJob: (job) =>
    set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, name, notes, photos) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id
          ? { ...j, name, notes, photos, updatedAt: new Date().toISOString() }
          : j,
      ),
    })),
  removeJob: (id) =>
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) })),
  setJobs: (jobs) => set({ jobs }),

  dbReady: false,
  setDbReady: (ready) => set({ dbReady: ready }),
}));
