// tools/handlers.js — сюда попадает управление, когда модель решает вызвать функцию.
// Каждый handler читает текущее состояние пользователя из БД, вносит изменение
// и сохраняет обратно. Возвращаемое значение отправляется модели как "результат
// вызова функции", чтобы она могла построить осмысленный ответ пользователю
// (например подтвердить создание или доложить результат поиска).

import { getState, patchState } from "../db.js";

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- ЗАМЕТКИ ----------

function create_note(userId, args) {
  const state = getState(userId);
  const note = {
    id: makeId("note"),
    title: args.title || "Без названия",
    text: args.text || "",
    annotations: [],
    tags: args.tags || [],
    categoryId: args.categoryId ?? null,
    createdAt: new Date().toISOString(),
  };
  patchState(userId, { notes: [note, ...state.notes] });
  return { success: true, note };
}

function update_note(userId, args) {
  const state = getState(userId);
  const idx = state.notes.findIndex((n) => n.id === args.id);
  if (idx === -1) return { success: false, error: "Заметка не найдена" };

  const updated = {
    ...state.notes[idx],
    ...(args.title !== undefined ? { title: args.title } : {}),
    ...(args.text !== undefined ? { text: args.text } : {}),
  };
  const nextNotes = [...state.notes];
  nextNotes[idx] = updated;
  patchState(userId, { notes: nextNotes });
  return { success: true, note: updated };
}

function search_notes(userId, args) {
  const state = getState(userId);
  const q = (args.query || "").toLowerCase();
  const results = state.notes
    .filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.text?.toLowerCase().includes(q) ||
        (n.tags || []).some((tag) => tag.toLowerCase().includes(q))
    )
    .slice(0, 10)
    .map((n) => ({ id: n.id, title: n.title, excerpt: (n.text || "").slice(0, 200) }));

  return { success: true, results };
}

// ---------- ЧЕК-ЛИСТЫ ----------

function create_checklist(userId, args) {
  const state = getState(userId);
  const items = (args.items || []).map((text) => ({
    id: makeId("item"),
    text,
    timerMinutes: null,
    timerSeconds: 0,
    done: false,
  }));

  const checklist = {
    id: makeId("chk"),
    title: args.title || "Без названия",
    type: args.type === "habit" ? "habit" : "once",
    icon: args.icon || "✅",
    days: [0, 1, 2, 3, 4, 5, 6],
    perDay: false,
    groups: [{ id: makeId("grp"), title: "Задачи", icon: args.icon || "✅", items }],
    contentByDay: {},
    progressByDate: {},
    createdAt: Date.now(),
  };

  patchState(userId, { checklists: [...state.checklists, checklist] });
  return { success: true, checklist };
}

function add_checklist_item(userId, args) {
  const state = getState(userId);
  const idx = state.checklists.findIndex((c) => c.id === args.checklistId);
  if (idx === -1) return { success: false, error: "Чек-лист не найден" };

  const checklist = state.checklists[idx];
  const newItems = (args.items || []).map((text) => ({
    id: makeId("item"),
    text,
    timerMinutes: null,
    timerSeconds: 0,
    done: false,
  }));

  const nextGroups = checklist.groups.length
    ? checklist.groups.map((g, i) => (i === 0 ? { ...g, items: [...g.items, ...newItems] } : g))
    : [{ id: makeId("grp"), title: "Задачи", icon: "✅", items: newItems }];

  const updated = { ...checklist, groups: nextGroups };
  const nextChecklists = [...state.checklists];
  nextChecklists[idx] = updated;
  patchState(userId, { checklists: nextChecklists });
  return { success: true, checklist: updated };
}

// ---------- КАЛЕНДАРЬ ----------

const EVENT_COLORS = ["#C4622D", "#2D6A4F", "#9C6B30", "#9C3848", "#6B5B95", "#3B7A9C"];

function create_event(userId, args) {
  const state = getState(userId);
  const event = {
    id: makeId("evt"),
    title: args.title,
    startTime: args.startTime,
    endTime: args.endTime || null,
    type: args.type || "personal",
    location: args.location || "",
    repeat: args.repeat || "none",
    reminder: "none",
    color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)],
    note: args.note || "",
    done: false,
  };
  patchState(userId, { events: [...state.events, event] });
  return { success: true, event };
}

function create_recurring_shift_events(userId, args) {
  const state = getState(userId);
  const { title, firstDate, shiftLengthHours, cycleDays, repeatCount } = args;
  const [y, m, d] = firstDate.split("-").map(Number);
  const events = [];

  for (let i = 0; i < repeatCount; i++) {
    const start = new Date(y, m - 1, d + i * cycleDays, 9, 0, 0);
    const end = new Date(start.getTime() + shiftLengthHours * 60 * 60 * 1000);

    events.push({
      id: makeId("evt"),
      title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      type: "work",
      location: "",
      repeat: "none", // каждая смена — отдельное событие, серию генерируем сразу целиком
      reminder: "none",
      color: EVENT_COLORS[1],
      note: "",
      done: false,
    });
  }

  patchState(userId, { events: [...state.events, ...events] });
  return { success: true, count: events.length, events };
}

function list_events(userId, args) {
  const state = getState(userId);
  const from = new Date(args.from);
  const to = new Date(args.to);
  to.setHours(23, 59, 59, 999);

  const events = state.events
    .filter((e) => {
      const t = new Date(e.startTime);
      return t >= from && t <= to;
    })
    .map((e) => ({ id: e.id, title: e.title, startTime: e.startTime, type: e.type }));

  return { success: true, events };
}

// ---------- СПОРТ ----------

function create_workout(userId, args) {
  const state = getState(userId);
  const workout = {
    id: makeId("wrk"),
    type: args.type,
    title: args.title || "",
    startTime: args.startTime,
    durationMin: args.durationMin || null,
    distanceKm: args.distanceKm || null,
    note: args.note || "",
    exercises: [],
    tags: [],
  };
  patchState(userId, { workouts: [...state.workouts, workout] });
  return { success: true, workout };
}

// ---------- ТЕСТЫ ----------

function create_quiz(userId, args) {
  const state = getState(userId);
  const quiz = {
    id: makeId("quiz"),
    title: args.title || "Тест",
    sourceNoteId: args.sourceNoteId || null,
    questions: args.questions || [],
    attempts: [],
    createdAt: Date.now(),
  };
  patchState(userId, { quizzes: [...state.quizzes, quiz] });
  return { success: true, quiz };
}

// ---------- Реестр ----------

export const toolHandlers = {
  create_note,
  update_note,
  search_notes,
  create_checklist,
  add_checklist_item,
  create_event,
  create_recurring_shift_events,
  list_events,
  create_workout,
  create_quiz,
};

export async function executeTool(userId, name, args) {
  const handler = toolHandlers[name];
  if (!handler) {
    return { success: false, error: `Неизвестная функция: ${name}` };
  }
  try {
    return handler(userId, args);
  } catch (err) {
    console.error(`[tool:${name}] error:`, err);
    return { success: false, error: err.message || String(err) };
  }
}
