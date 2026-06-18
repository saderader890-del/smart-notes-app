import { useState, useEffect, useRef } from "react";

// ─── Palette ───────────────────────────────────────────────────────────────
// Background: deep navy #0D1117
// Surface:    #161B22
// Card:       #1E2530
// Accent:     electric indigo #6366F1
// Accent2:    teal #2DD4BF
// Text:       #E6EDF3
// Muted:      #8B949E

// ─── Storage helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = "smartnotes_data";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { notes: [], quizzes: [], chatHistory: [] };
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
        "Authorization": `Bearer ${GROQ_API_KEY}`,
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
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
};

// ─── Styles ────────────────────────────────────────────────────────────────
const s = {
  app: {
    minHeight: "100vh",
    background: "#0D1117",
    color: "#E6EDF3",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },
  header: {
    padding: "20px 20px 12px",
    borderBottom: "1px solid #21262D",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#0D1117",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.3px",
    flex: 1,
    background: "linear-gradient(135deg, #6366F1, #2DD4BF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  nav: {
    display: "flex",
    background: "#161B22",
    borderTop: "1px solid #21262D",
    position: "sticky",
    bottom: 0,
    zIndex: 10,
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
    color: active ? "#6366F1" : "#8B949E",
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
    background: "#1E2530",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    border: "1px solid #21262D",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#E6EDF3" },
  cardText: { fontSize: 13, color: "#8B949E", lineHeight: 1.5, display: "-webkit-box",
    WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  tag: {
    display: "inline-block",
    background: "rgba(99,102,241,0.15)",
    color: "#6366F1",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 500,
    marginRight: 4,
    marginTop: 4,
  },
  btn: (variant = "primary") => ({
    padding: variant === "icon" ? "8px" : "10px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s",
    ...(variant === "primary"
      ? { background: "#6366F1", color: "#fff" }
      : variant === "danger"
      ? { background: "rgba(239,68,68,0.15)", color: "#EF4444" }
      : variant === "ghost"
      ? { background: "transparent", color: "#8B949E" }
      : { background: "#1E2530", color: "#E6EDF3", border: "1px solid #21262D" }),
  }),
  input: {
    width: "100%",
    background: "#1E2530",
    border: "1px solid #21262D",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#E6EDF3",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    background: "#1E2530",
    border: "1px solid #21262D",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#E6EDF3",
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    minHeight: 120,
    lineHeight: 1.6,
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  label: { fontSize: 12, color: "#8B949E", marginBottom: 6, display: "block", fontWeight: 500 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  section: { marginBottom: 20 },
  bubble: (isUser) => ({
    maxWidth: "82%",
    padding: "10px 14px",
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    background: isUser ? "#6366F1" : "#1E2530",
    color: isUser ? "#fff" : "#E6EDF3",
    fontSize: 14,
    lineHeight: 1.5,
    border: isUser ? "none" : "1px solid #21262D",
    alignSelf: isUser ? "flex-end" : "flex-start",
    whiteSpace: "pre-wrap",
  }),
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#8B949E",
  },
};

// ─── App ───────────────────────────────────────────────────────────────────
export default function SmartNotesApp() {
  const [tab, setTab] = useState("notes");
  const [data, setData] = useState(loadData);
  const [view, setView] = useState("list"); // list | edit | detail
  const [activeNote, setActiveNote] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizView, setQuizView] = useState("list"); // list | create | play
  const [search, setSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const chatRef = useRef(null);

  const persist = (next) => {
    setData(next);
    saveData(next);
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [data.chatHistory]);

  // ── Notes helpers ──────────────────────────────────────────────────────
  const newNote = () => {
    setActiveNote({ id: Date.now(), title: "", body: "", tags: [], createdAt: new Date().toISOString() });
    setView("edit");
  };

  const saveNote = (note) => {
    const exists = data.notes.find((n) => n.id === note.id);
    const notes = exists
      ? data.notes.map((n) => (n.id === note.id ? note : n))
      : [note, ...data.notes];
    persist({ ...data, notes });
    setView("list");
  };

  const deleteNote = (id) => {
    persist({ ...data, notes: data.notes.filter((n) => n.id !== id) });
    setView("list");
  };

  const filtered = data.notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  // ── AI helpers ─────────────────────────────────────────────────────────
  const notesContext = data.notes
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
        [{ role: "user", content: `Сделай краткое резюме этой заметки и предложи 3 вопроса для самопроверки:\n\n${note.title}\n${note.body}` }],
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
        [{
          role: "user",
          content: `Создай тест из 4 вопросов по этой заметке. Верни ТОЛЬКО JSON массив без markdown:
[{"q":"вопрос","options":["вар1","вар2","вар3","вар4"],"answer":0}]
Заметка: ${note.title}\n${note.body}`,
        }],
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
      setQuizView("list");
    } catch (e) {
      alert("Не удалось сгенерировать тест. Попробуйте ещё раз.");
      console.error(e);
    }
    setAiLoading(false);
  };

  // ── Render tabs ────────────────────────────────────────────────────────
  const renderNotes = () => {
    if (view === "edit") return <NoteEditor note={activeNote} onSave={saveNote} onCancel={() => setView("list")} />;
    if (view === "detail")
      return (
        <NoteDetail
          note={activeNote}
          onEdit={() => setView("edit")}
          onDelete={() => deleteNote(activeNote.id)}
          onBack={() => setView("list")}
          onSummarize={() => aiSummarize(activeNote)}
          onGenerateQuiz={() => generateQuizFromNote(activeNote)}
          aiLoading={aiLoading}
        />
      );
    return (
      <div>
        <div style={{ ...s.row, marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8B949E" }}>
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
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Нет заметок</div>
            <div style={{ fontSize: 13 }}>Создайте первую заметку</div>
          </div>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              style={s.card}
              onClick={() => { setActiveNote(note); setView("detail"); }}
            >
              <div style={s.cardTitle}>{note.title || "Без названия"}</div>
              <div style={s.cardText}>{note.body}</div>
              <div style={{ marginTop: 8 }}>
                {note.tags.map((t) => <span key={t} style={s.tag}>{t}</span>)}
                <span style={{ fontSize: 11, color: "#8B949E", float: "right", marginTop: 2 }}>
                  {new Date(note.createdAt).toLocaleDateString("ru")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderAI = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }} ref={chatRef}>
        {data.chatHistory.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>ИИ-ассистент</div>
            <div style={{ fontSize: 13 }}>Я знаю ваши заметки и помогу найти информацию, составить план или ответить на вопросы</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Что у меня есть по теме...?", "Суммируй мои знания о...", "Составь план изучения"].map((q) => (
                <button key={q} style={{ ...s.btn("secondary"), justifyContent: "center" }} onClick={() => setChatInput(q)}>
                  {q}
                </button>
              ))}
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
            <div style={{ ...s.bubble(false), color: "#8B949E" }}>Думаю...</div>
          </div>
        )}
      </div>
      <div style={{ ...s.row, paddingTop: 8, borderTop: "1px solid #21262D", paddingBottom: 8 }}>
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
          <button style={s.btn("ghost")} onClick={() => persist({ ...data, chatHistory: [] })} title="Очистить">
            <Icon d={icons.trash} size={16} />
          </button>
        )}
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (quizView === "create") return <QuizCreator onSave={(q) => { persist({ ...data, quizzes: [q, ...data.quizzes] }); setQuizView("list"); }} onCancel={() => setQuizView("list")} />;
    if (quizView === "play" && activeQuiz) return <QuizPlayer quiz={activeQuiz} onDone={(score) => {
      const updated = data.quizzes.map((q) => q.id === activeQuiz.id ? { ...q, results: [...q.results, { score, date: new Date().toISOString() }] } : q);
      persist({ ...data, quizzes: updated });
      setQuizView("list");
    }} onBack={() => setQuizView("list")} />;
    return (
      <div>
        <div style={{ ...s.row, marginBottom: 12 }}>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Мои тесты</div>
          <button style={s.btn("primary")} onClick={() => setQuizView("create")}>
            <Icon d={icons.plus} size={16} /> Создать
          </button>
        </div>
        {data.quizzes.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Нет тестов</div>
            <div style={{ fontSize: 13 }}>Создайте тест вручную или откройте заметку и нажмите «Создать тест с ИИ»</div>
          </div>
        ) : (
          data.quizzes.map((quiz) => {
            const last = quiz.results.at(-1);
            return (
              <div key={quiz.id} style={s.card} onClick={() => { setActiveQuiz(quiz); setQuizView("play"); }}>
                <div style={s.cardTitle}>{quiz.title}</div>
                <div style={{ ...s.row, marginTop: 8, justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#8B949E" }}>{quiz.questions.length} вопросов</span>
                  {last && (
                    <span style={{ fontSize: 12, color: last.score >= 70 ? "#2DD4BF" : "#F59E0B" }}>
                      Последний: {last.score}%
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const tabs = [
    { id: "notes", label: "Заметки", icon: icons.note },
    { id: "ai", label: "ИИ", icon: icons.ai },
    { id: "quiz", label: "Тесты", icon: icons.quiz },
  ];

  const headerTitle = tab === "notes" ? "📝 SmartNotes" : tab === "ai" ? "🤖 ИИ-ассистент" : "📋 Тесты";

  return (
    <div style={s.app}>
      <div style={s.header}>
        {(view !== "list" || quizView !== "list") && tab !== "ai" && (
          <button style={s.btn("ghost")} onClick={() => { setView("list"); setQuizView("list"); }}>
            <Icon d={icons.back} size={18} />
          </button>
        )}
        <div style={s.headerTitle}>{headerTitle}</div>
      </div>

      <div style={s.content}>
        {tab === "notes" && renderNotes()}
        {tab === "ai" && renderAI()}
        {tab === "quiz" && renderQuiz()}
      </div>

      <nav style={s.nav}>
        {tabs.map((t) => (
          <button key={t.id} style={s.navBtn(tab === t.id)} onClick={() => setTab(t.id)}>
            <Icon d={t.icon} size={22} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Note Editor ───────────────────────────────────────────────────────────
function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(note.tags || []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  return (
    <div>
      <div style={s.section}>
        <label style={s.label}>Название</label>
        <input style={s.input} placeholder="Название заметки" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div style={s.section}>
        <label style={s.label}>Содержание</label>
        <textarea style={s.textarea} placeholder="Запишите всё, что хотите сохранить..." value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
      </div>
      <div style={s.section}>
        <label style={s.label}>Теги</label>
        <div style={{ ...s.row, marginBottom: 8 }}>
          <input style={{ ...s.input, flex: 1 }} placeholder="Добавить тег..." value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()} />
          <button style={s.btn("secondary")} onClick={addTag}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((t) => (
            <span key={t} style={{ ...s.tag, cursor: "pointer" }} onClick={() => removeTag(t)}>
              {t} ×
            </span>
          ))}
        </div>
      </div>
      <div style={{ ...s.row, justifyContent: "flex-end", gap: 8, paddingBottom: 20 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>Отмена</button>
        <button style={s.btn("primary")} onClick={() => onSave({ ...note, title, body, tags })}>
          <Icon d={icons.check} size={16} /> Сохранить
        </button>
      </div>
    </div>
  );
}

// ─── Note Detail ───────────────────────────────────────────────────────────
function NoteDetail({ note, onEdit, onDelete, onBack, onSummarize, onGenerateQuiz, aiLoading }) {
  const [showSummary, setShowSummary] = useState(false);
  return (
    <div>
      <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#8B949E" }}>{new Date(note.createdAt).toLocaleString("ru")}</div>
        <div style={s.row}>
          <button style={s.btn("ghost")} onClick={onEdit}><Icon d={icons.edit} size={16} /></button>
          <button style={s.btn("danger")} onClick={onDelete}><Icon d={icons.trash} size={16} /></button>
        </div>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#E6EDF3" }}>{note.title || "Без названия"}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#C9D1D9", whiteSpace: "pre-wrap", marginBottom: 16 }}>{note.body}</p>
      {note.tags?.length > 0 && (
        <div style={{ marginBottom: 16 }}>{note.tags.map((t) => <span key={t} style={s.tag}>{t}</span>)}</div>
      )}
      <div style={{ borderTop: "1px solid #21262D", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <button style={s.btn("secondary")} onClick={() => { setShowSummary(true); onSummarize(); }} disabled={aiLoading}>
          <Icon d={icons.star} size={16} /> {aiLoading ? "Анализирую..." : "ИИ-резюме и вопросы"}
        </button>
        <button style={s.btn("secondary")} onClick={onGenerateQuiz} disabled={aiLoading}>
          <Icon d={icons.quiz} size={16} /> {aiLoading ? "Генерирую..." : "Создать тест с ИИ"}
        </button>
      </div>
      {showSummary && note.aiSummary && (
        <div style={{ ...s.card, marginTop: 16, borderColor: "#6366F1" }}>
          <div style={{ fontSize: 12, color: "#6366F1", fontWeight: 600, marginBottom: 8 }}>🤖 ИИ-анализ</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#C9D1D9" }}>{note.aiSummary}</div>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Creator ──────────────────────────────────────────────────────────
function QuizCreator({ onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { q: "", options: ["", "", "", ""], answer: 0 },
  ]);

  const addQ = () => setQuestions([...questions, { q: "", options: ["", "", "", ""], answer: 0 }]);
  const updateQ = (i, field, val) => {
    const qs = questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q);
    setQuestions(qs);
  };
  const updateOpt = (qi, oi, val) => {
    const qs = questions.map((q, idx) => {
      if (idx !== qi) return q;
      const opts = q.options.map((o, i) => i === oi ? val : o);
      return { ...q, options: opts };
    });
    setQuestions(qs);
  };
  const removeQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={s.section}>
        <label style={s.label}>Название теста</label>
        <input style={s.input} placeholder="Введите название..." value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      {questions.map((q, qi) => (
        <div key={qi} style={{ ...s.card, borderColor: "#6366F1" }}>
          <div style={{ ...s.row, marginBottom: 8, justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "#6366F1", fontWeight: 600 }}>Вопрос {qi + 1}</div>
            {questions.length > 1 && <button style={s.btn("ghost")} onClick={() => removeQ(qi)}><Icon d={icons.close} size={14} /></button>}
          </div>
          <input style={{ ...s.input, marginBottom: 10 }} placeholder="Текст вопроса..." value={q.q} onChange={(e) => updateQ(qi, "q", e.target.value)} />
          {q.options.map((opt, oi) => (
            <div key={oi} style={{ ...s.row, marginBottom: 6 }}>
              <button
                style={{ ...s.btn(q.answer === oi ? "primary" : "secondary"), padding: "6px 10px", flexShrink: 0 }}
                onClick={() => updateQ(qi, "answer", oi)}
                title="Отметить правильным"
              >
                {q.answer === oi ? "✓" : String.fromCharCode(65 + oi)}
              </button>
              <input style={s.input} placeholder={`Вариант ${String.fromCharCode(65 + oi)}`} value={opt} onChange={(e) => updateOpt(qi, oi, e.target.value)} />
            </div>
          ))}
        </div>
      ))}
      <button style={{ ...s.btn("secondary"), width: "100%", justifyContent: "center", marginBottom: 12 }} onClick={addQ}>
        <Icon d={icons.plus} size={16} /> Добавить вопрос
      </button>
      <div style={{ ...s.row, justifyContent: "flex-end", gap: 8, paddingBottom: 20 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>Отмена</button>
        <button style={s.btn("primary")} onClick={() => onSave({ id: Date.now(), title, questions, createdAt: new Date().toISOString(), results: [] })}>
          <Icon d={icons.check} size={16} /> Сохранить тест
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Player ───────────────────────────────────────────────────────────
function QuizPlayer({ quiz, onDone, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const q = quiz.questions[current];

  const confirm = () => {
    if (selected === null) return;
    const isCorrect = selected === q.answer;
    const next = [...answers, { selected, isCorrect }];
    setAnswers(next);
    if (current + 1 < quiz.questions.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    const correct = answers.filter((a) => a.isCorrect).length;
    const pct = Math.round((correct / quiz.questions.length) * 100);
    return (
      <div style={{ textAlign: "center", padding: "40px 16px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>{pct >= 70 ? "🎉" : "💪"}</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: pct >= 70 ? "#2DD4BF" : "#F59E0B" }}>
          {pct}%
        </div>
        <div style={{ fontSize: 15, color: "#8B949E", marginBottom: 24 }}>
          Правильных ответов: {correct} из {quiz.questions.length}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={s.btn("primary")} onClick={() => { setCurrent(0); setSelected(null); setAnswers([]); setDone(false); }}>
            Пройти снова
          </button>
          <button style={s.btn("ghost")} onClick={() => onDone(pct)}>
            Назад к тестам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#8B949E" }}>Вопрос {current + 1} / {quiz.questions.length}</div>
        <div style={{ fontSize: 12, color: "#8B949E" }}>{quiz.title}</div>
      </div>
      <div style={{ background: "#1E2530", borderRadius: 12, padding: "8px 0 4px", marginBottom: 4 }}>
        <div style={{ height: 4, borderRadius: 4, background: "#6366F1", width: `${((current) / quiz.questions.length) * 100}%`, transition: "width 0.3s" }} />
      </div>
      <div style={{ ...s.card, marginTop: 12, borderColor: "#6366F1" }}>
        <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{q.q}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {q.options.map((opt, i) => (
          <button key={i}
            style={{
              ...s.btn(selected === i ? "primary" : "secondary"),
              justifyContent: "flex-start",
              padding: "12px 16px",
              textAlign: "left",
              borderColor: selected === i ? "#6366F1" : "#21262D",
            }}
            onClick={() => setSelected(i)}
          >
            <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: selected === i ? "rgba(255,255,255,0.2)" : "#21262D",
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginRight: 8 }}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
      <button
        style={{ ...s.btn("primary"), width: "100%", justifyContent: "center", opacity: selected === null ? 0.5 : 1 }}
        onClick={confirm}
        disabled={selected === null}
      >
        {current + 1 === quiz.questions.length ? "Завершить" : "Следующий вопрос →"}
      </button>
    </div>
  );
}
