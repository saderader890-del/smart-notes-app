// db.js — простое хранилище на SQLite.
// Каждый пользователь (userId) имеет одну строку с полным JSON-состоянием
// (notes, checklists, workouts, events, quizzes...), в том же формате,
// который сейчас лежит в localStorage на фронтенде (STORAGE_KEY = "smartnotes_v3").
//
// Так миграция с localStorage на сервер становится тривиальной: то, что раньше
// клали в localStorage, теперь просто отправляем на сервер и обратно.

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "smartnotes.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS user_state (
    user_id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transcription_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,       -- queued | processing | done | error
    progress INTEGER DEFAULT 0, -- 0-100
    result_text TEXT,
    error TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

const DEFAULT_STATE = {
  notes: [],
  categories: [
    { id: 1, name: "📚 Учёба", color: "#C4622D" },
    { id: 2, name: "💼 Работа", color: "#2D6A4F" },
    { id: 3, name: "🎯 Личное", color: "#9C6B30" },
  ],
  quizzes: [],
  checklists: [],
  chatHistory: [],
  library: [],
  workouts: [],
  workoutTemplates: [],
  events: [],
  eventTemplates: [],
  dailyLogs: {},
};

export function getState(userId) {
  const row = db.prepare("SELECT state_json FROM user_state WHERE user_id = ?").get(userId);
  if (!row) {
    const initial = { ...DEFAULT_STATE };
    db.prepare(
      "INSERT INTO user_state (user_id, state_json, updated_at) VALUES (?, ?, ?)"
    ).run(userId, JSON.stringify(initial), Date.now());
    return initial;
  }
  return JSON.parse(row.state_json);
}

export function setState(userId, state) {
  db.prepare(
    `INSERT INTO user_state (user_id, state_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`
  ).run(userId, JSON.stringify(state), Date.now());
  return state;
}

// Обновляет только один "срез" состояния (например events), не трогая остальное.
export function patchState(userId, patch) {
  const current = getState(userId);
  const next = { ...current, ...patch };
  setState(userId, next);
  return next;
}

export function createTranscriptionJob(id, userId) {
  db.prepare(
    `INSERT INTO transcription_jobs (id, user_id, status, progress, created_at, updated_at)
     VALUES (?, ?, 'queued', 0, ?, ?)`
  ).run(id, userId, Date.now(), Date.now());
}

export function updateTranscriptionJob(id, patch) {
  const fields = [];
  const values = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  values.push(Date.now(), id);
  db.prepare(
    `UPDATE transcription_jobs SET ${fields.join(", ")}, updated_at = ? WHERE id = ?`
  ).run(...values);
}

export function getTranscriptionJob(id) {
  return db.prepare("SELECT * FROM transcription_jobs WHERE id = ?").get(id);
}

export default db;
