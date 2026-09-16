/**
 * BuildTape Pro — SQLite Database Layer (Web Stub)
 * Fallback for web where expo-sqlite is not supported.
 */

export interface JobRow {
  id: string;
  name: string;
  notes: string;
  photos: string;
  createdAt: string;
  updatedAt: string;
}

export interface TapeEntryRow {
  id: string;
  jobId: string | null;
  expression: string;
  result: string;
  resultTs: number;
  createdAt: string;
  type: "basic" | "stair" | "material" | "roof" | "memory";
}

const JOBS_KEY = "buildtape_jobs";
const TAPE_KEY = "buildtape_tape_entries";

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export async function initDatabase(): Promise<void> {}

export function getSetting(key: string, defaultValue: string = ""): string { 
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key) ?? defaultValue;
  }
  return defaultValue; 
}

export function setSetting(key: string, value: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
}

export function insertJob(job: JobRow): void {
  const jobs = getLocal<JobRow[]>(JOBS_KEY, []);
  setLocal(JOBS_KEY, [job, ...jobs.filter((j) => j.id !== job.id)]);
}

export function getJobs(): JobRow[] {
  return getLocal<JobRow[]>(JOBS_KEY, []);
}

export function updateJob(id: string, name: string, notes: string, photos: string): void {
  const jobs = getLocal<JobRow[]>(JOBS_KEY, []);
  const now = new Date().toISOString();
  setLocal(
    JOBS_KEY,
    jobs.map((j) => (j.id === id ? { ...j, name, notes, photos, updatedAt: now } : j)),
  );
}

export function deleteJob(id: string): void {
  const jobs = getLocal<JobRow[]>(JOBS_KEY, []);
  setLocal(JOBS_KEY, jobs.filter((j) => j.id !== id));
}

export function insertTapeEntry(entry: TapeEntryRow): void {
  const entries = getLocal<TapeEntryRow[]>(TAPE_KEY, []);
  setLocal(TAPE_KEY, [entry, ...entries.filter((e) => e.id !== entry.id)]);
}

export function getTapeEntries(limit?: number): TapeEntryRow[] {
  const entries = getLocal<TapeEntryRow[]>(TAPE_KEY, []);
  return limit !== undefined ? entries.slice(0, limit) : entries;
}

export function getTapeEntriesForJob(jobId: string): TapeEntryRow[] {
  const entries = getLocal<TapeEntryRow[]>(TAPE_KEY, []);
  return entries.filter((e) => e.jobId === jobId);
}

export function assignTapeEntryToJob(entryId: string, jobId: string | null): void {
  const entries = getLocal<TapeEntryRow[]>(TAPE_KEY, []);
  setLocal(
    TAPE_KEY,
    entries.map((e) => (e.id === entryId ? { ...e, jobId } : e)),
  );
}

export function deleteTapeEntry(id: string): void {
  const entries = getLocal<TapeEntryRow[]>(TAPE_KEY, []);
  setLocal(TAPE_KEY, entries.filter((e) => e.id !== id));
}

export function clearAllTapeEntries(): void {
  setLocal(TAPE_KEY, []);
}

export function countTapeEntries(): number {
  return getLocal<TapeEntryRow[]>(TAPE_KEY, []).length;
}

