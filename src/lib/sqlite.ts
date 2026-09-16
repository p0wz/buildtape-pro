/**
 * BuildTape Pro — SQLite Database Layer
 * expo-sqlite v14+ API. Gracefully degrades on web (in-memory only).
 */

import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export interface JobRow {
  id: string;
  name: string;
  notes: string;
  photos: string; // JSON array of URIs
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

// ─── In-memory fallback for web ───────────────────────────────────────────────

const IS_NATIVE = Platform.OS !== "web";

let _db: SQLite.SQLiteDatabase | null = null;

function getDb() {
  if (!IS_NATIVE) return null;
  if (!_db) {
    _db = SQLite.openDatabaseSync("buildtape.db");
  }
  return _db;
}

// ─── DB Init ─────────────────────────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  if (!IS_NATIVE) return; // web uses in-memory store only

  const db = getDb()!;
  db.execSync("PRAGMA journal_mode = WAL;");

  db.execSync(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      notes TEXT DEFAULT '',
      photos TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  
  // Migration for existing tables
  try {
    db.execSync(`ALTER TABLE jobs ADD COLUMN photos TEXT DEFAULT '[]';`);
  } catch (e) {
    // Column already exists
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS tape_entries (
      id TEXT PRIMARY KEY NOT NULL,
      jobId TEXT,
      expression TEXT NOT NULL,
      result TEXT NOT NULL,
      resultTs INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'basic',
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE SET NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function getSetting(key: string, defaultValue: string = ""): string {
  if (!IS_NATIVE) return defaultValue;
  try {
    const db = getDb()!;
    const row = db.getFirstSync<{ value: string }>(
      "SELECT value FROM settings WHERE key = ?",
      [key],
    );
    return row ? row.value : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setSetting(key: string, value: string): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    db.runSync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      [key, value],
    );
  } catch (e) {
    console.warn("setSetting failed:", e);
  }
}

// ─── Jobs ─────────────────────────────────────────────────────────────────

export function insertJob(job: JobRow): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    db.runSync(
      "INSERT INTO jobs (id, name, notes, photos, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
      [job.id, job.name, job.notes, job.photos || "[]", job.createdAt, job.updatedAt],
    );
  } catch (e) {
    console.warn("insertJob failed:", e);
  }
}

export function getJobs(): JobRow[] {
  if (!IS_NATIVE) return [];
  try {
    const db = getDb()!;
    return db.getAllSync<JobRow>("SELECT * FROM jobs ORDER BY updatedAt DESC");
  } catch {
    return [];
  }
}

export function updateJob(id: string, name: string, notes: string, photos: string): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    const now = new Date().toISOString();
    db.runSync(
      "UPDATE jobs SET name = ?, notes = ?, photos = ?, updatedAt = ? WHERE id = ?",
      [name, notes, photos || "[]", now, id],
    );
  } catch (e) {
    console.warn("updateJob failed:", e);
  }
}

export function deleteJob(id: string): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    db.runSync("DELETE FROM jobs WHERE id = ?", [id]);
  } catch (e) {
    console.warn("deleteJob failed:", e);
  }
}

// ─── Tape Entries ─────────────────────────────────────────────────────────

export function insertTapeEntry(entry: TapeEntryRow): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    db.runSync(
      `INSERT INTO tape_entries 
        (id, jobId, expression, result, resultTs, createdAt, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.jobId,
        entry.expression,
        entry.result,
        entry.resultTs,
        entry.createdAt,
        entry.type,
      ],
    );
  } catch (e) {
    console.warn("insertTapeEntry failed:", e);
  }
}

export function getTapeEntries(limit?: number): TapeEntryRow[] {
  if (!IS_NATIVE) return [];
  try {
    const db = getDb()!;
    if (limit !== undefined) {
      return db.getAllSync<TapeEntryRow>(
        "SELECT * FROM tape_entries ORDER BY createdAt DESC LIMIT ?",
        [limit],
      );
    }
    return db.getAllSync<TapeEntryRow>(
      "SELECT * FROM tape_entries ORDER BY createdAt DESC",
    );
  } catch {
    return [];
  }
}

export function getTapeEntriesForJob(jobId: string): TapeEntryRow[] {
  if (!IS_NATIVE) return [];
  try {
    const db = getDb()!;
    return db.getAllSync<TapeEntryRow>(
      "SELECT * FROM tape_entries WHERE jobId = ? ORDER BY createdAt DESC",
      [jobId],
    );
  } catch {
    return [];
  }
}

export function assignTapeEntryToJob(
  entryId: string,
  jobId: string | null,
): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    db.runSync(
      "UPDATE tape_entries SET jobId = ? WHERE id = ?",
      [jobId, entryId],
    );
  } catch (e) {
    console.warn("assignTapeEntryToJob failed:", e);
  }
}

export function deleteTapeEntry(id: string): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    db.runSync("DELETE FROM tape_entries WHERE id = ?", [id]);
  } catch (e) {
    console.warn("deleteTapeEntry failed:", e);
  }
}

export function clearAllTapeEntries(): void {
  if (!IS_NATIVE) return;
  try {
    const db = getDb()!;
    db.runSync("DELETE FROM tape_entries");
  } catch (e) {
    console.warn("clearAllTapeEntries failed:", e);
  }
}

export function countTapeEntries(): number {
  if (!IS_NATIVE) return 0;
  try {
    const db = getDb()!;
    const row = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM tape_entries",
    );
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}
