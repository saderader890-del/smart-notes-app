import { useState, useEffect, useRef, useMemo } from "react";

// ─── Theme Palette
// ───────────────────────────────────────────────────────

const themes = {
  dark: {
    bg: "#0D1117",
    surface: "#161B22",
    card: "#1E2530",
    border: "#21262D",
    text: "#E6EDF3",
    textMuted: "#8B949E",
    accent: "#6366F1",
    accent2: "#2DD4BF",
    success: "#2DD4BF",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  light: {
    bg: "#FFFFFF",
    surface: "#F6F8FA",
    card: "#FFFFFF",
    border: "#D0D7DE",
    text: "#24292F",
    textMuted: "#57606A",
    accent: "#0969DA",
    accent2: "#1a7f64",
    success: "#1a7f64",
    warning: "#D29922",
    danger: "#DA3633",
  },
};

// ─── Storage helpers
// ───────────────────────────────────────────────────────

const STORAGE_KEY = "smartnotes_v3";
const DRAFT_KEY = "smartnotes_draft";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    notes: [],
    categories: [
      { id: 1, name: "📚 Учёба", color: "#6366F1" },
      { id: 2, name: "💼 Работа", color: "#2DD4BF" },
      { id: 3, name: "🎯 Личное", color: "#F59E0B" },
    ],
    quizzes: [],
    chatHistory: [],
    library: [],
    theme: "dark",
    aiModel: "llama3.2",
  };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveDraft(note) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(note));
  } catch (_) {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (_) {}
}
// ─── Mock AI helper
// ───────────────────────────────────────────────────

async function askAI(messages, systemPrompt) {
  const userMessage = messages[messages.length - 1]?.content || "";

  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000)
    });
    if (response.ok) {
      const chatResponse = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          stream: false
        }),
        signal: AbortSignal.timeout(10000)
      });
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        return data.message.content;
      }
    }
  } catch (_) {}

  const responses = {
    "создай": "✅ Заметка создана! Вы можете начать писать содержимое.",
    "удали": "✅ Заметка удалена. Подтвердите удаление в диалоговом окне.",
    "переместить": "✅ Заметка перемещена в выбранную категорию.",
    "категория": "✅ Новая категория создана успешно!",
    "найти": "🔍 Поиск завершен. Вот результаты из вашей библиотеки и заметок.",
    "анализ": "📊 Анализ завершен. Вот краткое резюме и вопросы для самопроверки.",
    "привет": "👋 Привет! Я ваш ИИ-ассистент. Я могу помочь вам с заметками, библиотекой и поиском информации.",
    "помощь": "ℹ️ Я могу:\n- Создавать и удалять заметки\n- Организовывать их в категории\n- Анализировать содержимое\n- Искать информацию в библиотеке\n- Помогать с учебой",
  };

  for (const [key, value] of Object.entries(responses)) {
    if (userMessage.toLowerCase().includes(key)) {
      return value;
    }
  }

  return `Спасибо за вопрос: "${userMessage}"\n\nЯ помогу вам организовать информацию. Используйте меня для:\n• Анализа заметок\n• Поиска информации\n• Создания и управления категориями\n\n(Примечание: Для полной функциональности запустите: ollama serve)`;
}

// ─── Icons
// ───────────────────────────────────────────────────────────────

const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const icons = {
  note: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  ai: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l3 3",
  quiz: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4",
  library: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 17m0 0H9m11 0v-5h2.5A2.5 2.5 0 0 0 20 9.5M9 17v5M9 17H6.5M20 9.5V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  close: "M18 6L6 18M6 6l12 12",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  check: "M20 6L9 17l-5-5",
  back: "M19 12H5M12 5l-7 7 7 7",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  sun: "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9zm-9-10v2m0 16v2m9-9h-2m-16 0H2m15.66-6.66l-1.41 1.41M6.75 6.75L5.34 5.34M21.66 18.66l-1.41-1.41M6.75 17.25l-1.41 1.41",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  settings: "M12 2c-5.33 4.55-8 8.48-8 14.8 0 5.64 2.05 7.2 8 7.2s8-1.56 8-7.2c0-6.32-2.67-10.25-8-14.8z",
  menu: "M3 12h18M3 6h18M3 18h18",
};
// ─── Note Editor
// ────────────────────────────────────────────────────────

function NoteEditor({ note, categories, onSave, onCancel, theme: t, s, icons, Icon, isLandscape }) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(note.tags || []);
  const [categoryId, setCategoryId] = useState(note.categoryId);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  useEffect(() => {
    // Следим за изменениями
  }, [title, body, tags, categoryId]);

  return (
    <div style={{ display: isLandscape ? "grid" : "block", gridTemplateColumns: isLandscape ? "1fr 1fr" : undefined, gap: isLandscape ? "20px" : undefined }}>
      <div>
        <div style={s.section}>
          <label style={s.label}>Название</label>
          <input
            style={s.input}
            placeholder="Название заметки"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div style={s.section}>
          <label style={s.label}>Категория</label>
          <select
            style={{ ...s.input, cursor: "pointer" }}
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Без категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={isLandscape ? {} : s.section}>
        <label style={s.label}>Содержание</label>
        <textarea
          style={s.textarea}
          placeholder="Запишите всё, что хотите сохранить..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={isLandscape ? 8 : 6}
        />
      </div>
      <div style={isLandscape ? { gridColumn: "1 / -1" } : {}}>
        <div style={s.section}>
          <label style={s.label}>Теги</label>
          <div style={{ ...s.row, marginBottom: 8 }}>
            <input
              style={{ ...s.input, flex: 1 }}
              placeholder="Добавить тег..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <button style={s.btn("secondary")} onClick={addTag}>
              +
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-block",
                  background: `${t.accent}33`,
                  color: t.accent,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </span>
            ))}
          </div>
        </div>
        <div style={{ ...s.row, justifyContent: "flex-end", gap: 8, paddingBottom: 20 }}>
          <button style={s.btn("ghost")} onClick={onCancel}>
            Отмена
          </button>
          <button
            style={s.btn("primary")}
            onClick={() => onSave({ ...note, title, body, tags, categoryId })}
          >
            ✓ Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Note Detail
// ────────────────────────────────────────────────────────

function NoteDetail({
  note,
  categories,
  onEdit,
  onDelete,
  onBack,
  onSummarize,
  aiLoading,
  theme: t,
  s,
  icons,
  Icon,
  isLandscape,
}) {
  const [showSummary, setShowSummary] = useState(false);
  const cat = categories.find((c) => c.id === note.categoryId);

  return (
    <div style={{ display: isLandscape ? "grid" : "block", gridTemplateColumns: isLandscape ? "1fr 1fr" : undefined, gap: isLandscape ? "20px" : undefined }}>
      <div>
        <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: t.textMuted }}>
            {new Date(note.createdAt).toLocaleString("ru")}
          </div>
          <div style={s.row}>
            <button style={s.btn("ghost")} onClick={onEdit}>
              <Icon d={icons.edit} size={16} />
            </button>
            <button style={s.btn("danger")} onClick={onDelete}>
              <Icon d={icons.trash} size={16} />
            </button>
          </div>
        </div>
        {cat && <span style={s.categoryBadge(cat.color)}>{cat.name}</span>}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: t.text }}>
          {note.title || "Без названия"}
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: t.text, whiteSpace: "pre-wrap", marginBottom: 16 }}>
          {note.body}
        </p>
        {note.tags?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {note.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-block",
                  background: `${t.accent}22`,
                  color: t.accent,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                  marginRight: 4,
                  marginBottom: 4,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={isLandscape ? {} : { borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            style={s.btn("secondary")}
            onClick={() => {
              setShowSummary(true);
              onSummarize();
            }}
            disabled={aiLoading}
          >
            <Icon d={icons.star} size={16} /> {aiLoading ? "Анализирую..." : "ИИ-резюме"}
          </button>
        </div>
        {showSummary && note.aiSummary && (
          <div
            style={{
              ...s.card,
              marginTop: 16,
              borderColor: t.accent,
              background: `${t.accent}11`,
            }}
          >
            <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, marginBottom: 8 }}>
              🤖 ИИ-анализ
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                color: t.text,
              }}
            >
              {note.aiSummary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Main App
// ─────────────────────────────────────────────────────────────

export default function SmartNotesApp() {
  const [data, setData] = useState(loadData);
  const [theme, setTheme] = useState(data.theme);
  const [tab, setTab] = useState("notes");
  const [view, setView] = useState("list");
  const [activeNote, setActiveNote] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [librarySearch, setLibrarySearch] = useState("");
  const [orientation, setOrientation] = useState(window.innerWidth > window.innerHeight ? "landscape" : "portrait");
  const chatRef = useRef(null);

  const [saveStatus, setSaveStatus] = useState('idle');
  const [draftExists, setDraftExists] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);
  const t = themes[theme];

  const persist = (next) => {
    setData(next);
    saveData(next);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    persist({ ...data, theme: newTheme });
  };

  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.title || draft.body)) {
      setDraftExists(true);
    }
  }, []);

  useEffect(() => {
    if (view === 'edit' && activeNote) {
      if (saveTimer) clearTimeout(saveTimer);
      const timer = setTimeout(() => {
        saveDraft(activeNote);
        setSaveStatus('saving');
        if (activeNote.id) {
          const exists = data.notes.find(n => n.id === activeNote.id);
          if (exists) {
            const notes = data.notes.map(n =>
              n.id === activeNote.id ? { ...activeNote, updatedAt: new Date().toISOString() } : n
            );
            persist({ ...data, notes });
            setSaveStatus('saved');
            setDraftExists(true);
          } else if (activeNote.title || activeNote.body) {
            const newNote = {
              ...activeNote,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            persist({ ...data, notes: [newNote, ...data.notes] });
            setActiveNote(newNote);
            setSaveStatus('saved');
            setDraftExists(true);
          }
        } else if (activeNote.title || activeNote.body) {
          setSaveStatus('saved');
          setDraftExists(true);
        }
        setTimeout(() => {
          if (saveStatus !== 'saving') {
            setSaveStatus('idle');
          }
        }, 2000);
      }, 2000);
      setSaveTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [activeNote, view, data, saveStatus, saveTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && view === 'edit' && activeNote && (activeNote.title || activeNote.body)) {
        saveDraft(activeNote);
        setDraftExists(true);
        if (activeNote.id) {
          const exists = data.notes.find(n => n.id === activeNote.id);
          if (exists) {
            const notes = data.notes.map(n =>
              n.id === activeNote.id ? { ...activeNote, updatedAt: new Date().toISOString() } : n
            );
            persist({ ...data, notes });
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeNote, view, data]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (view === 'edit' && activeNote && (activeNote.title || activeNote.body)) {
        saveDraft(activeNote);
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные изменения.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeNote, view]);

  const restoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setActiveNote(draft);
      setView('edit');
      setDraftExists(false);
      clearDraft();
      showNotification('🔄 Черновик восстановлен');
    }
  };

  const discardDraft = () => {
    clearDraft();
    setDraftExists(false);
    showNotification('🗑️ Черновик удален');
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: ${t.surface};
      color: ${t.text};
      border: 1px solid ${t.border};
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 90%;
      text-align: center;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };
    useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? "landscape" : "portrait");
    };
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [data.chatHistory]);

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const category = {
      id: Date.now(),
      name: newCategoryName,
      color: newCategoryColor,
    };
    persist({ ...data, categories: [...data.categories, category] });
    setNewCategoryName("");
    setNewCategoryColor("#6366F1");
    setShowCategoryModal(false);
    showNotification('✅ Категория создана');
  };

  const deleteCategory = (id) => {
    const notes = data.notes.map((n) => (n.categoryId === id ? { ...n, categoryId: null } : n));
    persist({ ...data, categories: data.categories.filter((c) => c.id !== id), notes });
    showNotification('🗑️ Категория удалена');
  };

  const newNote = () => {
    const draft = loadDraft();
    if (draft && (draft.title || draft.body)) {
      if (window.confirm('У вас есть несохраненный черновик. Использовать его?')) {
        setActiveNote(draft);
        setView('edit');
        clearDraft();
        setDraftExists(false);
        return;
      }
    }
    setActiveNote({
      id: Date.now(),
      title: "",
      body: "",
      tags: [],
      categoryId: activeCategory,
      createdAt: new Date().toISOString(),
    });
    setView("edit");
    clearDraft();
    setDraftExists(false);
  };

  const saveNote = (note) => {
    const exists = data.notes.find((n) => n.id === note.id);
    const notes = exists ? data.notes.map((n) => (n.id === note.id ? note : n)) : [note, ...data.notes];
    persist({ ...data, notes });
    clearDraft();
    setDraftExists(false);
    setView("list");
    showNotification('✅ Заметка сохранена');
  };

  const deleteNote = (id) => {
    setShowDeleteConfirm(null);
    persist({ ...data, notes: data.notes.filter((n) => n.id !== id) });
    clearDraft();
    setDraftExists(false);
    setView("list");
    showNotification('🗑️ Заметка удалена');
  };

  const filtered = data.notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = activeCategory === null || n.categoryId === activeCategory;
    return matchSearch && matchCategory;
  });

  const notesContext = filtered
    .slice(0, 20)
    .map((n) => `[${n.title}]: ${n.body.slice(0, 300)}`)
    .join("\n\n");

  const libraryContext = data.library
    .slice(0, 10)
    .map((item) => `[${item.name}]: ${item.content.slice(0, 500)}`)
    .join("\n\n");

  const systemPrompt = `Ты умный ассистент приложения SmartNotes. У тебя есть доступ к заметкам и библиотеке пользователя.

Помогай искать информацию, суммировать, объяснять и создавать планы для изучения.

Отвечай кратко и по делу на русском языке.

ЗАМЕТКИ ПОЛЬЗОВАТЕЛЯ:
${notesContext || "Заметок пока нет."}

БИБЛИОТЕКА (загруженные файлы и книги):
${libraryContext || "Библиотека пуста."}`;

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    const userMsg = { role: "user", content: text };
    const history = [...data.chatHistory, userMsg];
    persist({ ...data, chatHistory: history });
    setChatLoading(true);
    try {
      const reply = await askAI(
        history.map((m) => ({ role: m.role, content: m.content })),
        systemPrompt
      );
      persist({ ...data, chatHistory: [...history, { role: "assistant", content: reply }] });
    } catch (_) {
      persist({
        ...data,
        chatHistory: [...history, { role: "assistant", content: "Ошибка соединения. Попробуйте снова." }],
      });
    }
    setChatLoading(false);
  };

  const aiSummarize = async (note) => {
    setAiLoading(true);
    try {
      const reply = await askAI(
        [
          {
            role: "user",
            content: `Сделай краткое резюме этой заметки и предложи 3 вопроса для самопроверки:\n\n${note.title}\n${note.body}`,
          },
        ],
        "Ты помощник для учёбы. Отвечай на русском."
      );
      setActiveNote({ ...note, aiSummary: reply });
    } catch (_) {}
    setAiLoading(false);
  };

  const addToLibrary = (name, content, type = "file") => {
    const libraryItem = {
      id: Date.now(),
      name,
      content,
      type,
      uploadedAt: new Date().toISOString(),
    };
    persist({ ...data, library: [...data.library, libraryItem] });
    showNotification('📚 Файл добавлен в библиотеку');
  };

  const deleteFromLibrary = (id) => {
    persist({ ...data, library: data.library.filter((item) => item.id !== id) });
    showNotification('🗑️ Файл удален из библиотеки');
  };

  const isLandscape = orientation === "landscape";
  const maxWidth = isLandscape ? "100%" : "480px";
  const contentPadding = isLandscape ? "24px" : "16px";
  const headerPadding = isLandscape ? "16px 24px 12px" : "20px 16px 12px";
  const cardPadding = isLandscape ? "20px" : "16px";

  // ⚠️ ВАЖНО: fontSize ПЕРЕМЕЩЕН ВНУТРЬ useMemo
  const s = useMemo(
    () => {
      const fontSize = {
        xs: isLandscape ? 11 : 10,
        sm: isLandscape ? 14 : 13,
        md: isLandscape ? 16 : 15,
        lg: isLandscape ? 20 : 18,
        xl: isLandscape ? 24 : 20,
      };

      return {
        app: {
          minHeight: "100vh",
          background: t.bg,
          color: t.text,
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
          display: "flex",
          flexDirection: "column",
          maxWidth: maxWidth,
          margin: "0 auto",
          position: "relative",
          transition: "background 0.3s, color 0.3s",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        },
        header: {
          padding: headerPadding,
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: t.surface,
          position: "sticky",
          top: 0,
          zIndex: 10,
          transition: "background 0.3s, border-color 0.3s",
          minHeight: isLandscape ? "60px" : "56px",
        },
        headerTitle: {
          fontSize: fontSize.lg,
          fontWeight: 700,
          letterSpacing: "-0.3px",
          flex: 1,
          color: theme === "dark" ? "transparent" : t.accent,
          background: theme === "dark" ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})` : "none",
          WebkitBackgroundClip: theme === "dark" ? "text" : "unset",
          WebkitTextFillColor: theme === "dark" ? "transparent" : "unset",
        },
        tabsContainer: {
          display: "flex",
          background: t.surface,
          borderBottom: `2px solid ${t.border}`,
          position: "sticky",
          top: isLandscape ? "60px" : "56px",
          zIndex: 9,
          overflowX: "auto",
          padding: "0 8px",
          minHeight: isLandscape ? "56px" : "52px",
          scrollBehavior: "smooth",
        },
        tabButton: (active) => ({
          flex: "0 0 auto",
          padding: isLandscape ? "12px 20px" : "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          borderBottom: active ? `3px solid ${t.accent}` : "3px solid transparent",
          color: active ? t.accent : t.textMuted,
          fontSize: fontSize.sm,
          fontWeight: active ? 700 : 500,
          cursor: "pointer",
          transition: "all 0.3s",
          whiteSpace: "nowrap",
        }),
        nav: {
          display: "none",
        },
        content: {
          flex: 1,
          padding: contentPadding,
          overflowY: "auto",
          animation: "fadeIn 0.4s ease-in",
          overflowX: "hidden",
        },
        card: {
          background: t.card,
          borderRadius: 12,
          padding: cardPadding,
          marginBottom: 12,
          border: `1px solid ${t.border}`,
          cursor: "pointer",
          transition: "all 0.3s",
          animation: "slideUp 0.4s ease-out",
        },
        cardTitle: {
          fontSize: fontSize.md,
          fontWeight: 600,
          marginBottom: 6,
          color: t.text,
        },
        cardText: {
          fontSize: fontSize.sm,
          color: t.textMuted,
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        },
        btn: (variant = "primary") => ({
          padding: variant === "icon" ? "8px" : isLandscape ? "12px 20px" : "10px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: fontSize.sm,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.2s",
          fontFamily: "inherit",
          ...(variant === "primary"
            ? { background: t.accent, color: "#fff" }
            : variant === "danger"
            ? { background: `${t.danger}22`, color: t.danger }
            : variant === "ghost"
            ? { background: "transparent", color: t.textMuted }
            : { background: t.card, color: t.text, border: `1px solid ${t.border}` }),
        }),
        input: {
          width: "100%",
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: isLandscape ? "12px 14px" : "10px 12px",
          color: t.text,
          fontSize: fontSize.sm,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        },
        textarea: {
          width: "100%",
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: isLandscape ? "12px 14px" : "10px 12px",
          color: t.text,
          fontSize: fontSize.sm,
          outline: "none",
          resize: "vertical",
          minHeight: isLandscape ? "200px" : "120px",
          lineHeight: 1.6,
          boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        },
        label: {
          fontSize: fontSize.xs,
          color: t.textMuted,
          marginBottom: 6,
          display: "block",
          fontWeight: 500,
        },
        row: {
          display: "flex",
          gap: 8,
          alignItems: "center",
        },
        section: {
          marginBottom: 20,
        },
        bubble: (isUser) => ({
          maxWidth: "82%",
          padding: isLandscape ? "12px 16px" : "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? t.accent : t.card,
          color: isUser ? "#fff" : t.text,
          fontSize: fontSize.sm,
          lineHeight: 1.5,
          border: isUser ? "none" : `1px solid ${t.border}`,
          alignSelf: isUser ? "flex-end" : "flex-start",
          whiteSpace: "pre-wrap",
          animation: "fadeIn 0.3s ease-in",
          wordBreak: "break-word",
        }),
        empty: {
          textAlign: "center",
          padding: isLandscape ? "80px 40px" : "60px 20px",
          color: t.textMuted,
        },
        categoryBadge: (color) => ({
          display: "inline-block",
          background: `${color}33`,
          color: color,
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: fontSize.xs,
          fontWeight: 500,
          marginRight: 6,
          marginBottom: 8,
          cursor: "pointer",
          border: `1px solid ${color}66`,
        }),
        modal: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          animation: "fadeIn 0.2s ease-out",
          padding: "20px",
        },
        modalContent: {
          background: t.card,
          borderRadius: 12,
          padding: isLandscape ? "28px" : "20px",
          width: "90%",
          maxWidth: isLandscape ? "600px" : "400px",
          border: `1px solid ${t.border}`,
          animation: "slideUp 0.3s ease-out",
          maxHeight: "90vh",
          overflowY: "auto",
        },
      };
    },
    [t, theme, isLandscape, maxWidth, headerPadding, contentPadding, cardPadding]
  ); // ← ВАЖНО! Точка с запятой здесь!

  const SaveIndicator = () => {
    if (saveStatus === 'idle' && !draftExists) return null;
    let statusText = '';
    let statusColor = t.textMuted;
    if (saveStatus === 'saving') {
      statusText = '💾 Сохранение...';
      statusColor = t.warning;
    } else if (saveStatus === 'saved') {
      statusText = '✅ Сохранено';
      statusColor = t.success;
    } else if (draftExists && view !== 'edit') {
      statusText = '📝 Есть черновик';
      statusColor = t.accent;
    }
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '8px 16px',
        borderRadius: 8,
        background: t.surface,
        border: `1px solid ${statusColor}`,
        color: statusColor,
        fontSize: 12,
        zIndex: 1000,
        transition: 'all 0.3s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        maxWidth: '90%',
      }}>
        {statusText}
      </div>
    );
  };
  const renderNotes = () => {
  if (view === "edit")
    return (
      <NoteEditor
        note={activeNote}
        categories={data.categories}
        onSave={saveNote}
        onCancel={() => {
          clearDraft();
          setDraftExists(false);
          setView("list");
        }}
        theme={t}
        s={s}
        icons={icons}
        Icon={Icon}
        isLandscape={isLandscape}
      />
    );

  if (view === "detail")
    return (
      <NoteDetail
        note={activeNote}
        categories={data.categories}
        onEdit={() => setView("edit")}
        onDelete={() => setShowDeleteConfirm(activeNote.id)}
        onBack={() => setView("list")}
        onSummarize={() => aiSummarize(activeNote)}
        aiLoading={aiLoading}
        theme={t}
        s={s}
        icons={icons}
        Icon={Icon}
        isLandscape={isLandscape}
      />
    );

  return (
    <div>
      {draftExists && (
        <div style={{
          padding: '12px 16px',
          background: `${t.accent}22`,
          borderRadius: 8,
          marginBottom: 12,
          border: `1px solid ${t.accent}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>
            📝 У вас есть несохраненный черновик
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={s.btn("primary")}
              onClick={restoreDraft}
            >
              Восстановить
            </button>
            <button
              style={s.btn("ghost")}
              onClick={discardDraft}
            >
              Удалить
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ ...s.row, marginBottom: 12, justifyContent: "space-between" }}>
          <div style={{ fontSize: s.label.fontSize, fontWeight: 600, color: t.textMuted }}>КАТЕГОРИИ</div>
          <button style={s.btn("ghost")} onClick={() => setShowCategoryModal(true)}>
            <Icon d={icons.plus} size={14} />
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, overflowX: "auto" }}>
          <button
            style={{
              ...s.categoryBadge(t.accent),
              border: activeCategory === null ? `2px solid ${t.accent}` : `1px solid ${t.accent}66`,
              background: activeCategory === null ? `${t.accent}44` : `${t.accent}22`,
            }}
            onClick={() => setActiveCategory(null)}
          >
            Все
          </button>
          {data.categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 4,
              }}
            >
              <button
                style={{
                  ...s.categoryBadge(cat.color),
                  border: activeCategory === cat.id ? `2px solid ${cat.color}` : `1px solid ${cat.color}66`,
                  background: activeCategory === cat.id ? `${cat.color}44` : `${cat.color}22`,
                  marginRight: 0,
                }}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
              <button
                style={{
                  background: `${t.danger}22`,
                  color: t.danger,
                  border: `1px solid ${t.danger}44`,
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: 0,
                  transition: "all 0.2s",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Удалить категорию "${cat.name}"? Заметки станут "без категории"`)) {
                    deleteCategory(cat.id);
                  }
                }}
                title="Удалить категорию"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.row, marginBottom: 12, gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: t.textMuted,
            }}
          >
            <Icon d={icons.search} size={16} />
          </span>
          <input
            style={{ ...s.input, paddingLeft: 34 }}
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button style={s.btn("primary")} onClick={newNote}>
          <Icon d={icons.plus} size={16} />
          {!isLandscape && "Новая"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Нет заметок</div>
          <div style={{ fontSize: 13 }}>
            {activeCategory !== null ? "Создайте заметку в этой категории" : "Создайте первую заметку"}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isLandscape ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr", gap: 12 }}>
          {filtered.map((note) => {
            const cat = data.categories.find((c) => c.id === note.categoryId);
            return (
              <div
                key={note.id}
                style={s.card}
                onClick={() => {
                  setActiveNote(note);
                  setView("detail");
                }}
              >
                <div style={s.cardTitle}>{note.title || "Без названия"}</div>
                <div style={s.cardText}>{note.body}</div>
                <div style={{ marginTop: 8 }}>
                  {cat && <span style={s.categoryBadge(cat.color)}>{cat.name}</span>}
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-block",
                        background: `${t.accent}22`,
                        color: t.accent,
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 500,
                        marginRight: 4,
                        marginBottom: 4,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  <span style={{ fontSize: 11, color: t.textMuted, float: "right", marginTop: 2 }}>
                    {new Date(note.createdAt).toLocaleDateString("ru")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const renderAI = () => (
  <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - " + (isLandscape ? "116px" : "108px") + ")" }}>
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingBottom: 8,
      }}
      ref={chatRef}
    >
      {data.chatHistory.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>ИИ-ассистент</div>
          <div style={{ fontSize: 13 }}>
            Я помогу вам с заметками и библиотекой. Спрашивайте что угодно!
          </div>
        </div>
      )}
      {data.chatHistory.map((m, i) => (
        <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", paddingRight: m.role === "user" ? 0 : 8, paddingLeft: m.role === "user" ? 8 : 0 }}>
          <div style={s.bubble(m.role === "user")}>{m.content}</div>
        </div>
      ))}
      {chatLoading && (
        <div style={{ display: "flex" }}>
          <div style={{ ...s.bubble(false), color: t.textMuted }}>Думаю...</div>
        </div>
      )}
    </div>
    <div
      style={{
        ...s.row,
        paddingTop: 8,
        borderTop: `1px solid ${t.border}`,
        paddingBottom: 8,
        gap: 12,
      }}
    >
      <input
        style={{ ...s.input, flex: 1 }}
        placeholder="Спросите..."
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendChat()}
      />
      <button style={{ ...s.btn("primary"), padding: "10px 14px" }} onClick={sendChat} disabled={chatLoading}>
        <Icon d={icons.send} size={16} />
      </button>
      {data.chatHistory.length > 0 && (
        <button
          style={s.btn("ghost")}
          onClick={() => persist({ ...data, chatHistory: [] })}
          title="Очистить"
        >
          <Icon d={icons.trash} size={16} />
        </button>
      )}
    </div>
  </div>
);

const renderLibrary = () => {
  const filteredLibrary = data.library.filter((item) =>
    item.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
    item.content.toLowerCase().includes(librarySearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ ...s.row, marginBottom: 12, gap: 8 }}>
          <input
            type="text"
            style={{ ...s.input, flex: 1 }}
            placeholder="Название файла..."
            id="libName"
          />
          <button
            style={s.btn("primary")}
            onClick={() => {
              const name = document.getElementById("libName").value;
              const content = document.getElementById("libContent").value;
              if (name.trim() && content.trim()) {
                addToLibrary(name, content, "file");
                document.getElementById("libName").value = "";
                document.getElementById("libContent").value = "";
              }
            }}
          >
            <Icon d={icons.upload} size={16} />
            {!isLandscape && "Добавить"}
          </button>
        </div>
        <textarea
          id="libContent"
          style={{ ...s.textarea, marginBottom: 12 }}
          placeholder="Вставьте содержимое..."
          rows={isLandscape ? 6 : 4}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: t.textMuted,
            }}
          >
            <Icon d={icons.search} size={16} />
          </span>
          <input
            style={{ ...s.input, paddingLeft: 34 }}
            placeholder="Поиск..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
          />
        </div>
      </div>

      {filteredLibrary.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Библиотека пуста</div>
          <div style={{ fontSize: 13 }}>Добавьте файлы для анализа</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isLandscape ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr", gap: 12 }}>
          {filteredLibrary.map((item) => (
            <div key={item.id} style={s.card}>
              <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 8 }}>
                <div style={s.cardTitle}>{item.name}</div>
                <div style={s.row}>
                  <button
                    style={s.btn("ghost")}
                    onClick={() => {
                      setChatInput(
                        `Проанализируй это из библиотеки: "${item.name}"\n\n${item.content.slice(0, 200)}...`
                      );
                      setTab("ai");
                    }}
                    title="Отправить в чат"
                  >
                    <Icon d={icons.send} size={14} />
                  </button>
                  <button
                    style={s.btn("danger")}
                    onClick={() => deleteFromLibrary(item.id)}
                    title="Удалить"
                  >
                    <Icon d={icons.trash} size={14} />
                  </button>
                </div>
              </div>
              <div style={{ ...s.cardText, display: "block" }}>{item.content.slice(0, 200)}...</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>
                {new Date(item.uploadedAt).toLocaleDateString("ru")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
    const headerTitle =
    tab === "notes" ? "📝 SmartNotes" : tab === "ai" ? "🤖 ИИ" : tab === "library" ? "📚 Библиотека" : "📋 Тесты";

  const tabs = [
    { id: "notes", label: "Заметки", icon: icons.note },
    { id: "ai", label: "ИИ", icon: icons.ai },
    { id: "library", label: "Библиотека", icon: icons.library },
    { id: "quiz", label: "Тесты", icon: icons.quiz },
  ];

  return (
    <div style={s.app}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
          height: 100%;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
          background: ${t.bg};
          color: ${t.text};
        }
        input, textarea {
          -webkit-user-select: text;
          user-select: text;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${t.surface};
        }
        ::-webkit-scrollbar-thumb {
          background: ${t.border};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${t.textMuted};
        }
        @media (orientation: landscape) {
          body {
            overflow: hidden;
          }
        }
        @media (max-width: 768px) {
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        }
      `}</style>

      <div style={s.header}>
        {(view !== "list" || (tab !== "ai" && tab !== "quiz" && tab !== "library")) && (
          <button
            style={s.btn("ghost")}
            onClick={() => {
              setView("list");
            }}
          >
            <Icon d={icons.back} size={18} />
          </button>
        )}
        <div style={s.headerTitle}>{headerTitle}</div>
        <button style={s.btn("ghost")} onClick={toggleTheme} title="Переключить тему">
          <Icon d={theme === "dark" ? icons.sun : icons.moon} size={18} />
        </button>
      </div>

      <div style={s.tabsContainer}>
        {tabs.map((t) => (
          <button key={t.id} style={s.tabButton(tab === t.id)} onClick={() => setTab(t.id)}>
            <Icon d={t.icon} size={16} />
            {!isLandscape && t.label}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {tab === "notes" && renderNotes()}
        {tab === "ai" && renderAI()}
        {tab === "library" && renderLibrary()}
        {tab === "quiz" && <div style={s.empty}>📋 Раздел "Тесты" в разработке</div>}
      </div>

      {showCategoryModal && (
        <div style={s.modal} onClick={() => setShowCategoryModal(false)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.cardTitle, marginBottom: 16 }}>
              <Icon d={icons.folder} size={16} style={{ marginRight: 6 }} /> Новая категория
            </div>
            <div style={s.section}>
              <label style={s.label}>Название</label>
              <input
                style={s.input}
                placeholder="Например: 📚 Учёба"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div style={s.section}>
              <label style={s.label}>Цвет</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["#6366F1", "#2DD4BF", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"].map((color) => (
                  <button
                    key={color}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: color,
                      border: newCategoryColor === color ? `3px solid ${t.text}` : `2px solid ${t.border}`,
                      cursor: "pointer",
                    }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                ))}
              </div>
            </div>
            <div style={{ ...s.row, justifyContent: "flex-end", gap: 8 }}>
              <button style={s.btn("ghost")} onClick={() => setShowCategoryModal(false)}>
                Отмена
              </button>
              <button style={s.btn("primary")} onClick={addCategory}>
                <Icon d={icons.plus} size={16} /> Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={s.modal} onClick={() => setShowDeleteConfirm(null)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.cardTitle, marginBottom: 16, color: t.danger }}>⚠️ Подтвердите удаление</div>
            <div style={{ marginBottom: 20, fontSize: 14, color: t.text }}>
              Вы уверены, что хотите удалить заметку <strong>"{activeNote?.title || "Без названия"}"</strong>?
              <br />
              <span style={{ color: t.textMuted, fontSize: 12, marginTop: 8 }}>Это действие нельзя отменить.</span>
            </div>
            <div style={{ ...s.row, justifyContent: "flex-end", gap: 8 }}>
              <button style={s.btn("ghost")} onClick={() => setShowDeleteConfirm(null)}>
                Отмена
              </button>
              <button
                style={s.btn("danger")}
                onClick={() => {
                  deleteNote(showDeleteConfirm);
                }}
              >
                <Icon d={icons.trash} size={16} /> Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <SaveIndicator />
    </div>
  );
}
