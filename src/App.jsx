import { useState, useEffect, useRef } from "react";

// ─── Theme Palette ───────────────────────────────────────────────────────
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

// ─── Storage helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = "smartnotes_v2";

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
    theme: "dark",
  };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

// ─── Groq API helper ───────────────────────────────────────────────────────
async function askGroq(messages, systemPrompt) {
  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return "❌ API ключ не найден! Добавьте REACT_APP_GROQ_API_KEY в .env файл";
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Groq API Error:", error);
      return "Ошибка API. Проверьте ключ и лимиты.";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Ошибка ответа.";
  } catch (error) {
    console.error("Request error:", error);
    return "Ошибка соединения. Попробуйте снова.";
  }
}

// ─── Icons ─────────────────────────────────────────────────────────────────
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
  sun: "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9zm-9-10v2m0 16v2m9-9h-2m-16 0H2m15.66-6.66l-1.41 1.41M6.75 6.75L5.34 5.34M21.66 18.66l-1.41-1.41M6.75 17.25l-1.41 1.41",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  settings: "M12 2c-5.33 4.55-8 8.48-8 14.8 0 5.64 2.05 7.2 8 7.2s8-1.56 8-7.2c0-6.32-2.67-10.25-8-14.8z",
};

// ─── Main App ──────────────────────────────────────────────────────────────
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
  const chatRef = useRef(null);

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
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [data.chatHistory]);

  // ── Category helpers ──────────────────────────────────────────────────────
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
  };

  const deleteCategory = (id) => {
    const notes = data.notes.map((n) => (n.categoryId === id ? { ...n, categoryId: null } : n));
    persist({ ...data, categories: data.categories.filter((c) => c.id !== id), notes });
  };

  // ── Notes helpers ──────────────────────────────────────────────────────────
  const newNote = () => {
    setActiveNote({
      id: Date.now(),
      title: "",
      body: "",
      tags: [],
      categoryId: activeCategory,
      createdAt: new Date().toISOString(),
    });
    setView("edit");
  };

  const saveNote = (note) => {
    const exists = data.notes.find((n) => n.id === note.id);
    const notes = exists ? data.notes.map((n) => (n.id === note.id ? note : n)) : [note, ...data.notes];
    persist({ ...data, notes });
    setView("list");
  };

  const deleteNote = (id) => {
    persist({ ...data, notes: data.notes.filter((n) => n.id !== id) });
    setView("list");
  };

  const filtered = data.notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = activeCategory === null || n.categoryId === activeCategory;
    return matchSearch && matchCategory;
  });

  // ── AI helpers ─────────────────────────────────────────────────────────────
  const notesContext = filtered
    .slice(0, 20)
    .map((n) => `[${n.title}]: ${n.body.slice(0, 300)}`)
    .join("\n\n");

  const systemPrompt = `Ты умный ассистент приложения SmartNotes. У тебя есть доступ к заметкам пользователя.
Помогай искать информацию, суммировать, объяснять и создавать планы для изучения.
Отвечай кратко и по делу на русском языке.

ЗАМЕТКИ ПОЛЬЗОВАТЕЛЯ:
${notesContext || "Заметок пока нет."}`;

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    const userMsg = { role: "user", content: text };
    const history = [...data.chatHistory, userMsg];
    persist({ ...data, chatHistory: history });
    setChatLoading(true);
    try {
      const reply = await askGroq(
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
      const reply = await askGroq(
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

  const generateQuizFromNote = async (note) => {
    setAiLoading(true);
    try {
      const reply = await askGroq(
        [
          {
            role: "user",
            content: `Создай тест из 4 вопросов по этой заметке. Верни ТОЛЬКО JSON массив без markdown:
[{"q":"вопрос","options":["вар1","вар2","вар3","вар4"],"answer":0}]
Заметка: ${note.title}\n${note.body}`,
          },
        ],
        "Ты генератор тестов. Отвечай ТОЛЬКО валидным JSON без объяснений и без markdown."
      );
      const clean = reply.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(clean);
      const quiz = {
        id: Date.now(),
        title: `Тест: ${note.title}`,
        sourceNoteId: note.id,
        questions,
        createdAt: new Date().toISOString(),
        results: [],
      };
      persist({ ...data, quizzes: [quiz, ...data.quizzes] });
      setTab("quiz");
    } catch (e) {
      alert("Не удалось сгенерировать тест. Попробуйте ещё раз.");
      console.error(e);
    }
    setAiLoading(false);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = {
    app: {
      minHeight: "100vh",
      background: t.bg,
      color: t.text,
      fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      display: "flex",
      flexDirection: "column",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      transition: "background 0.3s, color 0.3s",
    },
    header: {
      padding: "20px 16px 12px",
      borderBottom: `1px solid ${t.border}`,
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: t.surface,
      position: "sticky",
      top: 0,
      zIndex: 10,
      transition: "background 0.3s, border-color 0.3s",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: "-0.3px",
      flex: 1,
      background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    nav: {
      display: "flex",
      background: t.surface,
      borderTop: `1px solid ${t.border}`,
      position: "sticky",
      bottom: 0,
      zIndex: 10,
      transition: "background 0.3s, border-color 0.3s",
    },
    navBtn: (active) => ({
      flex: 1,
      padding: "12px 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      background: "none",
      border: "none",
      color: active ? t.accent : t.textMuted,
      fontSize: 10,
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    content: {
      flex: 1,
      padding: "16px 16px 0",
      overflowY: "auto",
    },
    card: {
      background: t.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      border: `1px solid ${t.border}`,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: 600,
      marginBottom: 6,
      color: t.text,
    },
    cardText: {
      fontSize: 13,
      color: t.textMuted,
      lineHeight: 1.5,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    btn: (variant = "primary") => ({
      padding: variant === "icon" ? "8px" : "10px 16px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 14,
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
      padding: "10px 12px",
      color: t.text,
      fontSize: 14,
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
      padding: "10px 12px",
      color: t.text,
      fontSize: 14,
      outline: "none",
      resize: "vertical",
      minHeight: 120,
      lineHeight: 1.6,
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    label: {
      fontSize: 12,
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
      padding: "10px 14px",
      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      background: isUser ? t.accent : t.card,
      color: isUser ? "#fff" : t.text,
      fontSize: 14,
      lineHeight: 1.5,
      border: isUser ? "none" : `1px solid ${t.border}`,
      alignSelf: isUser ? "flex-end" : "flex-start",
      whiteSpace: "pre-wrap",
    }),
    empty: {
      textAlign: "center",
      padding: "60px 20px",
      color: t.textMuted,
    },
    categoryBadge: (color) => ({
      display: "inline-block",
      background: `${color}33`,
      color: color,
      borderRadius: 6,
      padding: "4px 10px",
      fontSize: 11,
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
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    },
    modalContent: {
      background: t.card,
      borderRadius: 12,
      padding: 20,
      width: "90%",
      maxWidth: 400,
      border: `1px solid ${t.border}`,
    },
  };

  // ── Render Notes ───────────────────────────────────────────────────────────
  const renderNotes = () => {
    if (view === "edit")
      return (
        <NoteEditor
          note={activeNote}
          categories={data.categories}
          onSave={saveNote}
          onCancel={() => setView("list")}
          theme={t}
          s={s}
        />
      );
    if (view === "detail")
      return (
        <NoteDetail
          note={activeNote}
          categories={data.categories}
          onEdit={() => setView("edit")}
          onDelete={() => deleteNote(activeNote.id)}
          onBack={() => setView("list")}
          onSummarize={() => aiSummarize(activeNote)}
          onGenerateQuiz={() => generateQuizFromNote(activeNote)}
          aiLoading={aiLoading}
          theme={t}
          s={s}
          icons={icons}
          Icon={Icon}
        />
      );

    return (
      <div>
        {/* Categories */}
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ ...s.row, marginBottom: 12, justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>КАТЕГОРИИ</div>
            <button style={s.btn("ghost")} onClick={() => setShowCategoryModal(true)}>
              <Icon d={icons.plus} size={14} />
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
        marginBottom: 4
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

        {/* Search */}
        <div style={{ ...s.row, marginBottom: 12 }}>
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
              placeholder="Поиск по заметкам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button style={s.btn("primary")} onClick={newNote}>
            <Icon d={icons.plus} size={16} /> Новая
          </button>
        </div>

        {/* Notes List */}
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Нет заметок</div>
            <div style={{ fontSize: 13 }}>
              {activeCategory !== null ? "Создайте заметку в этой категории" : "Создайте первую заметку"}
            </div>
          </div>
        ) : (
          filtered.map((note) => {
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
          })
        )}
      </div>
    );
  };

  // ── Render AI ──────────────────────────────────────────────────────────────
  const renderAI = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
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
              Я знаю ваши заметки и помогу найти информацию, составить план или ответить на вопросы
            </div>
          </div>
        )}
        {data.chatHistory.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
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
        }}
      >
        <input
          style={{ ...s.input, flex: 1 }}
          placeholder="Спросить ИИ..."
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

  // ── Main render ────────────────────────────────────────────────────────────
  const headerTitle =
    tab === "notes" ? "📝 SmartNotes" : tab === "ai" ? "🤖 ИИ-ассистент" : "📋 Тесты";

  const tabs = [
    { id: "notes", label: "Заметки", icon: icons.note },
    { id: "ai", label: "ИИ", icon: icons.ai },
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
        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
          background: ${t.bg};
          color: ${t.text};
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
      `}</style>

      <div style={s.header}>
        {(view !== "list" || (tab !== "ai" && tab !== "quiz")) && (
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

      <div style={s.content}>
        {tab === "notes" && renderNotes()}
        {tab === "ai" && renderAI()}
        {tab === "quiz" && <div style={s.empty}>📋 Раздел "Тесты" в разработке</div>}
      </div>

      <nav style={s.nav}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={s.navBtn(tab === t.id)}
            onClick={() => setTab(t.id)}
          >
            <Icon d={t.icon} size={22} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={s.modal} onClick={() => setShowCategoryModal(false)}>
          <div
            style={s.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
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
              <div style={{ display: "flex", gap: 8 }}>
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
    </div>
  );
}

// ─── Note Editor ───────────────────────────────────────────────────────────
function NoteEditor({ note, categories, onSave, onCancel, theme: t, s }) {
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

  return (
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
      <div style={s.section}>
        <label style={s.label}>Содержание</label>
        <textarea
          style={s.textarea}
          placeholder="Запишите всё, что хотите сохранить..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
        />
      </div>
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
  );
}

// ─── Note Detail ───────────────────────────────────────────────────────────
function NoteDetail({
  note,
  categories,
  onEdit,
  onDelete,
  onBack,
  onSummarize,
  onGenerateQuiz,
  aiLoading,
  theme: t,
  s,
  icons,
  Icon,
}) {
  const [showSummary, setShowSummary] = useState(false);
  const cat = categories.find((c) => c.id === note.categoryId);

  return (
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
      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          style={s.btn("secondary")}
          onClick={() => {
            setShowSummary(true);
            onSummarize();
          }}
          disabled={aiLoading}
        >
          <Icon d={icons.star} size={16} /> {aiLoading ? "Анализирую..." : "ИИ-резюме и вопросы"}
        </button>
        <button style={s.btn("secondary")} onClick={onGenerateQuiz} disabled={aiLoading}>
          <Icon d={icons.quiz} size={16} /> {aiLoading ? "Генерирую..." : "Создать тест с ИИ"}
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
  );
}
