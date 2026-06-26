/* Полный обновлённый App.jsx — включает подзаметки (subnotes), объединение preview в NoteDetail,
   удаление превью в редакторе и автоскролл чата (предыдущие правки сохранены) */
import { useState, useEffect, useRef, useMemo } from "react";

/* ===== themes, constants, helper functions (migr, annotations, storage, askAI, icons) ===== */

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

const STORAGE_KEY = "smartnotes_v3";
const DRAFT_KEY = "smartnotes_draft";
const SCROLL_POSITION_KEY = "smartnotes_scroll";

/* Convert legacy blocks -> { text, annotations } */
function blocksToTextAndAnnotations(blocks = []) {
  let text = "";
  const annotations = [];
  let offset = 0;
  for (const b of blocks) {
    const t = b.text || "";
    if (b.background) {
      annotations.push({
        id: `ann_${Date.now()}_${Math.random()}`,
        type: "color",
        start: offset,
        end: offset + t.length,
        value: b.background,
      });
    }
    if (b.link) {
      // legacy links -> treat as subnotes only if they match an id; else ignore
      annotations.push({
        id: `ann_${Date.now()}_${Math.random()}`,
        type: "subnote",
        start: offset,
        end: offset + t.length,
        value: b.link,
      });
    }
    text += t;
    offset += t.length;
  }
  return { text, annotations };
}

function normalizeAnnotations(annotations = []) {
  const anns = annotations.slice().filter((a) => a && a.end > a.start);
  anns.sort((x, y) => x.start - y.start || x.end - y.end);
  const merged = [];
  for (const a of anns) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.type === a.type &&
      last.value === a.value &&
      last.end >= a.start
    ) {
      last.end = Math.max(last.end, a.end);
    } else {
      merged.push({ ...a });
    }
  }
  return merged;
}

function applyAnnotation(annotations = [], start, end, type, value, textLength) {
  start = Math.max(0, Math.min(start, textLength || Infinity));
  end = Math.max(0, Math.min(end, textLength || Infinity));
  if (start >= end) return annotations.slice();

  const result = [];
  for (const a of annotations) {
    if (a.type !== type || a.end <= start || a.start >= end) {
      result.push({ ...a });
      continue;
    }
    if (a.start < start) result.push({ ...a, end: start });
    if (a.end > end) result.push({ ...a, start: end });
  }

  result.push({
    id: `ann_${Date.now()}_${Math.random()}`,
    type,
    start,
    end,
    value,
  });

  return normalizeAnnotations(result);
}

/* adjust annotations for edit */
function adjustAnnotationsForEdit(annotations = [], editPos, removedLength, insertedLength) {
  const delta = insertedLength - removedLength;
  if (removedLength === 0 && insertedLength === 0) return annotations.slice();

  const res = [];
  for (const a of annotations) {
    if (a.end <= editPos) {
      res.push({ ...a });
      continue;
    }
    if (a.start >= editPos + removedLength) {
      res.push({ ...a, start: a.start + delta, end: a.end + delta });
      continue;
    }
    const leftPart = a.start < editPos ? { ...a, end: editPos } : null;
    const rightPart = a.end > editPos + removedLength ? { ...a, start: editPos + delta, end: a.end + delta } : null;
    if (leftPart && leftPart.end > leftPart.start) res.push(leftPart);
    if (rightPart && rightPart.end > rightPart.start) res.push(rightPart);
  }
  return normalizeAnnotations(res);
}

/* get fragments by boundaries */
function getAnnotatedFragments(text = "", annotations = []) {
  if (!text) return [];
  const anns = (annotations || []).slice().filter(a => a.end > a.start && a.start < text.length && a.end > 0);
  anns.forEach(a => {
    a.start = Math.max(0, Math.min(a.start, text.length));
    a.end = Math.max(0, Math.min(a.end, text.length));
  });
  const boundaries = new Set([0, text.length]);
  anns.forEach(a => { boundaries.add(a.start); boundaries.add(a.end); });
  const sorted = Array.from(boundaries).sort((a,b)=>a-b);
  const fragments = [];
  for (let i=0;i<sorted.length-1;i++){
    const s=sorted[i], e=sorted[i+1];
    if (s===e) continue;
    const segText = text.slice(s,e);
    const segAnns = anns.filter(a => a.start < e && a.end > s);
    fragments.push({ text: segText, start: s, end: e, annotations: segAnns });
  }
  return fragments;
}

/* storage helpers */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) || {};
      const base = {
        notes: [],
        categories: [
          { id: 1, name: "📚 Учёба", color: "#6366F1" },
          { id: 2, name: "💼 Работа", color: "#2DD4BF" },
          { id: 3, name: "🎯 Личное", color: "#F59E0B" },
        ],
        quizzes: [],
        chatHistory: [],
        library: [],
        theme: "light",
        aiModel: "llama3.2",
      };
      const data = { ...base, ...parsed };

      data.notes = (data.notes || []).map(n => {
        if (n.text || n.annotations) {
          return {
            ...n,
            text: typeof n.text === "string" ? n.text : "",
            annotations: Array.isArray(n.annotations) ? n.annotations : [],
            tags: n.tags || [],
            categoryId: n.categoryId ?? null,
          };
        }
        if (n.blocks && Array.isArray(n.blocks)) {
          const { text, annotations } = blocksToTextAndAnnotations(n.blocks);
          return { ...n, text, annotations, tags: n.tags || [], categoryId: n.categoryId ?? null };
        }
        if (n.body) {
          return { ...n, text: n.body, annotations: [], tags: n.tags || [], categoryId: n.categoryId ?? null };
        }
        return { ...n, text: "", annotations: [], tags: n.tags || [], categoryId: n.categoryId ?? null };
      });

      return data;
    }
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
    theme: "light",
    aiModel: "llama3.2",
  };
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}
function loadDraft() { try { const r=localStorage.getItem(DRAFT_KEY); if(r) return JSON.parse(r);}catch(_){} return null; }
function saveDraft(note){ try{ localStorage.setItem(DRAFT_KEY, JSON.stringify(note)); }catch(_){} }
function clearDraft(){ try{ localStorage.removeItem(DRAFT_KEY);}catch(_){} }
function saveScrollPosition(noteId, position){ try{ localStorage.setItem(`${SCROLL_POSITION_KEY}_${noteId}`, String(position)); }catch(_){} }
function loadScrollPosition(noteId){ try{ const pos=localStorage.getItem(`${SCROLL_POSITION_KEY}_${noteId}`); const p=pos?parseInt(pos,10):0; return Number.isNaN(p)?0:p; }catch(_){} return 0; }

/* askAI (unchanged) */
async function askAI(messages, systemPrompt) {
  const userMessage = messages[messages.length - 1]?.content || "";
  try {
    const body = {
      model: "mistralai/mistral-7b-instruct:free",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 500,
    };
    const fetchOptions = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") fetchOptions.signal = AbortSignal.timeout(15000);
    const apiKey = (typeof process !== "undefined" && process.env && process.env.REACT_APP_OPENROUTER_KEY) || null;
    if (apiKey) fetchOptions.headers = { ...fetchOptions.headers, Authorization: `Bearer ${apiKey}`};
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", fetchOptions);
    if (response && response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "Извините, не удалось получить ответ.";
    }
  } catch (err) { console.log("AI error:", err); }
  const fallbackResponses = {
    "создай": "✅ Заметка создана!",
    "удали": "✅ Заметка удалена.",
    "переместить": "✅ Заметка перемещена.",
    "категория": "✅ Категория создана!",
    "найти": "🔍 Поиск завершен.",
    "анализ": "📊 Анализ завершен.",
    "привет": "👋 Привет! Я ваш ИИ-ассистент.",
    "помощь": "ℹ️ Я могу помочь с заметками и библиотекой.",
  };
  for (const [k,v] of Object.entries(fallbackResponses)) if (userMessage.toLowerCase().includes(k)) return v;
  return `Спасибо за вопрос: "${userMessage}"\n\nЯ помогу вам организовать информацию.`;
}

/* icons */
const Icon = ({ d, size = 20, color = "currentColor", ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}><path d={d} /></svg>
);

const icons = { note: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0", ai: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l3 3", quiz: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4", library: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 17m0 0H9m11 0v-5h2.5A2.5 2.5 0 0 0 20 9.5M9 17v5M9 17H6.5M20 9.5V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5", plus: "M12 5v14M5 12h14", trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6", send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z", edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", back:"M19 12H5M12 5l-7 7 7 7", sun:"...", moon:"..." };

/* ===== Subnote overlay component (read-only) ===== */
function SubnoteOverlay({ note, onClose, theme, s }) {
  if (!note) return null;
  const fragments = getAnnotatedFragments(note.text || "", note.annotations || []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(900px, 95%)",
        maxWidth: "900px",
        background: theme.card,
        borderLeft: `1px solid ${theme.border}`,
        zIndex: 2000,
        boxShadow: "-20px 0 40px rgba(0,0,0,0.4)",
        animation: "slideInFromRight 0.28s ease",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: 18, borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: theme.text }}>{note.title || "Без названия"}</div>
        <button style={{ ...s.btn("ghost") }} onClick={onClose}>✕</button>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 12 }}>
          {fragments.map((frag, idx) => {
            const colorAnn = frag.annotations.find(a => a.type === "color");
            const subAnn = frag.annotations.find(a => a.type === "subnote");
            const style = {
              background: colorAnn ? colorAnn.value : "transparent",
              padding: colorAnn ? "2px 4px" : undefined,
              borderRadius: colorAnn ? 4 : undefined,
              color: subAnn ? theme.accent : theme.text,
              textDecoration: subAnn ? "underline" : "none",
            };
            return <span key={idx} style={style}>{frag.text}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ===== NoteEditor (textarea-only now; subnote picker modal) ===== */
function NoteEditor({ note, categories, onSave, onCancel, theme: t, s, allNotes }) {
  const [title, setTitle] = useState(note.title || "");
  const [text, setText] = useState(note.text || "");
  const [annotations, setAnnotations] = useState(note.annotations || []);
  const [selectedColor, setSelectedColor] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(note.tags || []);
  const [categoryId, setCategoryId] = useState(note.categoryId || null);
  const textareaRef = useRef(null);
  const prevTextRef = useRef(text);

  const [showSubnotePicker, setShowSubnotePicker] = useState(false);

  const colors = [
    { name: "Красный", value: "rgba(239, 68, 68, 0.3)" },
    { name: "Жёлтый", value: "rgba(234, 179, 8, 0.3)" },
    { name: "Синий", value: "rgba(59, 130, 246, 0.3)" },
    { name: "Оранжевый", value: "rgba(249, 115, 22, 0.3)" },
    { name: "Зелёный", value: "rgba(34, 197, 94, 0.3)" },
    { name: "Фиолетовый", value: "rgba(168, 85, 247, 0.3)" },
  ];

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput("");
  };
  const removeTag = (t) => setTags(tags.filter(x=>x!==t));

  const getPlainText = () => text;

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const oldValue = prevTextRef.current || "";
    if (newValue === oldValue) { setText(newValue); prevTextRef.current = newValue; return; }
    let start = 0;
    while (start < oldValue.length && start < newValue.length && oldValue[start] === newValue[start]) start++;
    let oldEnd = oldValue.length - 1, newEnd = newValue.length - 1;
    while (oldEnd >= start && newEnd >= start && oldValue[oldEnd] === newValue[newEnd]) { oldEnd--; newEnd--; }
    const removedLength = oldEnd >= start ? oldEnd - start +1 : 0;
    const insertedLength = newEnd >= start ? newEnd - start +1 : 0;
    const updatedAnnotations = adjustAnnotationsForEdit(annotations, start, removedLength, insertedLength);
    setAnnotations(updatedAnnotations);
    setText(newValue);
    prevTextRef.current = newValue;
  };

  const applyColor = (value) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    if (start === end) return;
    const newAnns = applyAnnotation(annotations, start, end, "color", value, text.length);
    setAnnotations(newAnns);
    setSelectedColor(value);
    setTimeout(()=>{ try{ ta.selectionStart = end; ta.selectionEnd = end; ta.focus(); }catch(_){} },0);
  };

  // Open subnote picker modal
  const openSubnotePicker = () => {
    setShowSubnotePicker(true);
  };

  // choose a note to link as subnote
  const addSubnoteToSelection = (targetNoteId) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    if (start === end) return;
    const newAnns = applyAnnotation(annotations, start, end, "subnote", targetNoteId, text.length);
    setAnnotations(newAnns);
    setShowSubnotePicker(false);
    setTimeout(()=>{ try{ ta.selectionStart = end; ta.selectionEnd = end; ta.focus(); } catch(_){} },0);
  };

  useEffect(() => {
    saveDraft({ ...note, title, text, annotations, tags, categoryId });
  }, [title, text, annotations, tags, categoryId, note]);

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <div style={s.section}>
        <label style={s.label}>Название</label>
        <input style={s.input} placeholder="Название заметки" value={title} onChange={(e)=>setTitle(e.target.value)} />
      </div>

      <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize:12, color: t.textMuted }}>Выделить цветом:</span>
        {colors.map(c=>(
          <button key={c.value} title={c.name} style={{ width:28,height:28,borderRadius:"50%",background:c.value, border: selectedColor===c.value ? "2px solid #fff":"1px solid rgba(0,0,0,0.2)", cursor:"pointer" }} onClick={()=>applyColor(c.value)} />
        ))}
        <button style={s.btn("secondary")} onClick={openSubnotePicker}>🔗 Добавить подзаметку</button>
        <button style={s.btn("ghost")} onClick={()=>{ /* reset selection color annotations in selection */ const ta=textareaRef.current; if(!ta) return; const sidx=ta.selectionStart, eidx=ta.selectionEnd; if(sidx===eidx) return; const remaining = annotations.filter(a => !(a.type==='color' && a.start < eidx && a.end > sidx)); setAnnotations(normalizeAnnotations(remaining)); }}>✖ Сбросить</button>
      </div>

      <div style={s.section}>
        <label style={s.label}>Содержание</label>
        <textarea ref={textareaRef} style={{ ...s.textarea, minHeight: "300px", fontSize: 16, lineHeight:1.8 }} placeholder="Запишите всё, что хотите сохранить..." value={getPlainText()} onChange={handleTextChange} rows={10} />
      </div>

      <div style={s.section}>
        <label style={s.label}>Теги</label>
        <div style={{ ...s.row, marginBottom:8 }}>
          <input style={{ ...s.input, flex:1 }} placeholder="Добавить тег..." value={tagInput} onChange={(e)=>setTagInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&addTag()} />
          <button style={s.btn("secondary")} onClick={addTag}>+</button>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {tags.map(tg=>(
            <span key={tg} onClick={()=>removeTag(tg)} style={{ background: `${t.accent}33`, color: t.accent, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>{tg} ×</span>
          ))}
        </div>
      </div>

      <div style={{ ...s.row, justifyContent:"flex-end", gap:8, paddingBottom:20 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>Отмена</button>
        <button style={s.btn("primary")} onClick={()=> onSave({ ...note, title, text, annotations: normalizeAnnotations(annotations), tags, categoryId })}>✓ Сохранить</button>
      </div>

      {showSubnotePicker && (
        <div style={{ position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.5)", zIndex:1500, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowSubnotePicker(false)}>
          <div style={{ width:"90%", maxWidth:700, background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:16 }} onClick={(e)=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ fontWeight:700 }}>Выберите заметку для подзаметки</div>
              <button style={s.btn("ghost")} onClick={()=>setShowSubnotePicker(false)}>✕</button>
            </div>
            <div style={{ maxHeight: "60vh", overflowY:"auto" }}>
              {allNotes.filter(n => n.id !== note.id).length === 0 && <div style={{ color:t.textMuted }}>Нет других заметок</div>}
              {allNotes.filter(n => n.id !== note.id).map(n => (
                <div key={n.id} onClick={()=>addSubnoteToSelection(n.id)} style={{ padding:10, borderRadius:6, cursor:"pointer", border:`1px solid ${t.border}`, marginBottom:8 }}>
                  <div style={{ fontWeight:700, color:t.text }}>{n.title || "Без названия"}</div>
                  <div style={{ color:t.textMuted, fontSize:13 }}>{ (n.text||"").slice(0,200) }{(n.text||"").length>200?"...":""}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
                 }
/* ===== NoteDetail: use editor-style preview (as requested) and subnote click opens overlay ===== */
function NoteDetail({ note, categories, onEdit, onDelete, onSummarize, aiLoading, theme: t, s, onOpenSubnote }) {
  const contentRef = useRef(null);
  const cat = categories.find(c=>c.id===note.categoryId);
  const text = note.text || "";
  const annotations = note.annotations || [];

  useEffect(()=> {
    if (contentRef.current) {
      const p = loadScrollPosition(note.id);
      contentRef.current.scrollTop = p;
    }
  }, [note.id]);

  const handleScroll = () => { if (contentRef.current) saveScrollPosition(note.id, contentRef.current.scrollTop); };

  const fragments = getAnnotatedFragments(text, annotations);

  return (
    <div style={{ maxWidth:"100%", margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ color:t.textMuted, fontSize:12 }}>{new Date(note.createdAt).toLocaleString("ru")}</div>
        <div style={s.row}>
          <button style={s.btn("ghost")} onClick={onEdit}><Icon d={icons.edit} size={16} /></button>
          <button style={s.btn("danger")} onClick={onDelete}><Icon d={icons.trash} size={16} /></button>
        </div>
      </div>

      {cat && <div style={s.categoryBadge(cat.color)}>{cat.name}</div>}

      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:12, color:t.text }}>{note.title || "Без названия"}</h2>

      <div ref={contentRef} onScroll={handleScroll} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 12, minHeight: 220, whiteSpace: "pre-wrap", maxHeight: "60vh", overflowY:"auto" }}>
        {fragments.map((frag, idx) => {
          const colorAnn = frag.annotations.find(a=>a.type==="color");
          const subAnn = frag.annotations.find(a=>a.type==="subnote");
          const style = {
            background: colorAnn ? colorAnn.value : "transparent",
            padding: colorAnn ? "2px 4px": undefined,
            borderRadius: colorAnn ? 4 : undefined,
            color: subAnn ? t.accent : t.text,
            textDecoration: subAnn ? "underline" : "none",
            cursor: subAnn ? "pointer" : "default",
          };
          if (subAnn) {
            // subAnn.value contains target note id
            return <span key={idx} style={style} onClick={() => onOpenSubnote && onOpenSubnote(subAnn.value)}>{frag.text}</span>;
          }
          return <span key={idx} style={style}>{frag.text}</span>;
        })}
      </div>

      <div style={{ marginTop:12 }}>
        <button style={s.btn("secondary")} onClick={() => { onSummarize(); }} disabled={aiLoading}><Icon d={icons.star} size={16} /> {aiLoading ? "Анализирую...": "ИИ-резюме"}</button>
      </div>
    </div>
  );
}
/* ===== Main App ===== */
export default function SmartNotesApp() {
  const [data, setData] = useState(()=> loadData());
  const [theme, setTheme] = useState(data.theme||"light");
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
  const [libName, setLibName] = useState("");
  const [libContent, setLibContent] = useState("");
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [windowHeight, setWindowHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 768);
  const chatRef = useRef(null);

  const prevHeightRef = useRef(0);
  const isUserAtBottomRef = useRef(true);

  const [saveStatus, setSaveStatus] = useState("idle");
  const [draftExists, setDraftExists] = useState(false);
  const saveTimerRef = useRef(null);

  const [subnoteOpenId, setSubnoteOpenId] = useState(null);

  const t = themes[theme];

  const filteredLibrary = useMemo(()=> data.library.filter(item => item.name.toLowerCase().includes(librarySearch.toLowerCase()) || item.content.toLowerCase().includes(librarySearch.toLowerCase())), [data.library, librarySearch]);

  useEffect(() => {
    const handleResize = () => { setWindowWidth(window.innerWidth); setWindowHeight(window.innerHeight); };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    handleResize();
    return ()=> { window.removeEventListener("resize", handleResize); window.removeEventListener("orientationchange", handleResize); };
  }, []);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isLandscape = windowWidth > windowHeight;
  let maxWidth = isMobile ? (isLandscape ? "100%" : "480px") : "100%";
  let contentPadding = isMobile ? "16px" : "40px";
  let headerPadding = isMobile ? (isLandscape ? "20px 16px 12px" : "24px 24px 16px") : "24px 40px 16px";
  let cardPadding = isMobile ? 16 : 24;
  let bottomNavPadding = isMobile ? "60px" : "80px";
  if (isTablet){ contentPadding = isLandscape ? "32px" : "24px"; headerPadding = isLandscape ? "20px 32px 16px" : "24px 24px 16px"; cardPadding = isLandscape?24:20; bottomNavPadding="72px"; }

  const gridColumns = isMobile ? 1 : isTablet ? 2 : 3;

  const persist = (next) => { setData(next); saveData(next); };

  const toggleTheme = () => { const newTheme = theme === "dark" ? "light" : "dark"; setTheme(newTheme); persist({ ...data, theme: newTheme }); };

  useEffect(()=> { const draft = loadDraft(); if (draft && (draft.title || draft.text || (draft.annotations && draft.annotations.length))) setDraftExists(true); }, []);

  useEffect(()=> {
    if (view === "edit" && activeNote) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const timer = setTimeout(()=> {
        saveDraft(activeNote);
        setSaveStatus("saving");
        if (activeNote.id) {
          const exists = data.notes.find(n=>n.id===activeNote.id);
          if (exists) {
            const notes = data.notes.map(n => n.id===activeNote.id ? { ...activeNote, updatedAt: new Date().toISOString() } : n);
            persist({ ...data, notes });
            setSaveStatus("saved");
            setDraftExists(true);
          } else if (activeNote.title || activeNote.text || (activeNote.annotations && activeNote.annotations.some(b=>b && b.start < b.end))) {
            const newNote = { ...activeNote, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            persist({ ...data, notes: [newNote, ...data.notes] });
            setActiveNote(newNote);
            setSaveStatus("saved");
            setDraftExists(true);
          } else setSaveStatus("idle");
        } else if (activeNote.title || activeNote.text || (activeNote.annotations && activeNote.annotations.some(b=>b && b.start < b.end))) {
          setSaveStatus("saved"); setDraftExists(true);
        } else setSaveStatus("idle");
        setTimeout(()=> setSaveStatus("idle"), 2000);
      }, 2000);
      saveTimerRef.current = timer;
      return ()=> clearTimeout(timer);
    }
  }, [activeNote, view, data]);

  useEffect(()=> {
    const handleVisibilityChange = () => {
      if (document.hidden && view === "edit" && activeNote && (activeNote.title || activeNote.text || (activeNote.annotations && activeNote.annotations.some(b=>b && b.start < b.end)))) {
        saveDraft(activeNote);
        setDraftExists(true);
        if (activeNote.id) {
          const exists = data.notes.find(n=>n.id===activeNote.id);
          if (exists) {
            const notes = data.notes.map(n => n.id===activeNote.id ? { ...activeNote, updatedAt: new Date().toISOString() } : n);
            persist({ ...data, notes });
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return ()=> document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeNote, view, data]);

  useEffect(()=> {
    const handleBeforeUnload = (e) => {
      if (view === "edit" && activeNote && (activeNote.title || activeNote.text || (activeNote.annotations && activeNote.annotations.some(b=>b && b.start < b.end)))) {
        saveDraft(activeNote);
        e.preventDefault();
        e.returnValue = "У вас есть несохраненные изменения.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return ()=> window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeNote, view]);

  const restoreDraft = () => {
    const draft = loadDraft();
    if (draft) { setActiveNote(draft); setView("edit"); setDraftExists(false); clearDraft(); showNotification("🔄 Черновик восстановлен"); }
  };
  const discardDraft = () => { clearDraft(); setDraftExists(false); showNotification("🗑️ Черновик удален"); };

  const showNotification = (message) => {
    const notification = document.createElement("div");
    notification.style.cssText = `position:fixed; bottom:${isMobile?"80px":"100px"}; left:50%; transform:translateX(-50%); padding:12px 24px; background:${t.surface}; color:${t.text}; border:1px solid ${t.border}; border-radius:8px; z-index:9999;`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(()=> { notification.style.opacity="0"; notification.style.transition="opacity 0.3s"; setTimeout(()=>notification.remove(),300); }, 2500);
  };

  const addCategory = () => { if (!newCategoryName.trim()) return; const category = { id: Date.now(), name: newCategoryName, color: newCategoryColor }; persist({ ...data, categories: [...data.categories, category] }); setNewCategoryName(""); setNewCategoryColor("#6366F1"); setShowCategoryModal(false); showNotification("✅ Категория создана"); };
  const deleteCategory = (id) => { const notes = data.notes.map(n => n.categoryId===id ? { ...n, categoryId: null } : n); persist({ ...data, categories: data.categories.filter(c=>c.id!==id), notes }); showNotification("🗑️ Категория удалена"); };

  const newNote = () => {
    const draft = loadDraft();
    if (draft && (draft.title || draft.text || draft.annotations)) {
      if (window.confirm("У вас есть несохраненный черновик. Использовать его?")) { setActiveNote(draft); setView("edit"); clearDraft(); setDraftExists(false); return; }
    }
    setActiveNote({ id: Date.now(), title:"", text:"", annotations:[], tags:[], categoryId: activeCategory, createdAt: new Date().toISOString() });
    setView("edit"); clearDraft(); setDraftExists(false);
  };

  const saveNote = (note) => {
    const exists = data.notes.find(n=>n.id===note.id);
    const normalizedNote = { ...note, annotations: normalizeAnnotations(note.annotations||[]), text: note.text||"" };
    const notes = exists ? data.notes.map(n=> n.id===note.id? normalizedNote : n) : [normalizedNote, ...data.notes];
    persist({ ...data, notes });
    clearDraft(); setDraftExists(false); setView("list"); showNotification("✅ Заметка сохранена");
  };

  const deleteNote = (id) => { setShowDeleteConfirm(null); persist({ ...data, notes: data.notes.filter(n=>n.id!==id) }); clearDraft(); setDraftExists(false); setView("list"); showNotification("🗑️ Заметка удалена"); };

  const filtered = data.notes.filter(n => {
    const tags = n.tags || [];
    const q = search.toLowerCase();
    const matchSearch = (n.title && n.title.toLowerCase().includes(q)) || (n.text && n.text.toLowerCase().includes(q)) || tags.some(tag => tag.toLowerCase().includes(q));
    const matchCategory = activeCategory === null || n.categoryId === activeCategory;
    return matchSearch && matchCategory;
  });

  const notesContext = filtered.slice(0,20).map(n => `[${n.title}]: ${(n.text||"").slice(0,300)}`).join("\n\n");
  const libraryContext = data.library.slice(0,10).map(item => `[${item.name}]: ${item.content.slice(0,500)}`).join("\n\n");

  const aiSummarize = async (note) => {
    setAiLoading(true);
    try {
      const reply = await askAI([{ role:"user", content:`Сделай краткое резюме этой заметки и предложи 3 вопроса для самопроверки:\n\n${note.title}\n${note.text||""}` }], "Ты помощник для учёбы. Отвечай на русском.");
      const updatedNote = { ...note, aiSummary: reply };
      setActiveNote(updatedNote);
      const exists = data.notes.find(n=>n.id===note.id);
      if (exists) {
        const notes = data.notes.map(n=> n.id===note.id ? updatedNote : n);
        persist({ ...data, notes });
      } else persist({ ...data, notes: [updatedNote, ...data.notes] });
    } catch (err) { console.error("aiSummarize error:", err); } finally { setAiLoading(false); }
  };

  // Chat autoscroll logic
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 48;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      isUserAtBottomRef.current = atBottom;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return ()=> el.removeEventListener("scroll", onScroll);
  }, [tab]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const currentHeight = el.scrollHeight;
    const isNewMessage = currentHeight > prevHeightRef.current;
    if (isNewMessage && isUserAtBottomRef.current) {
      el.scrollTo({ top: currentHeight, behavior: "smooth" });
    }
    prevHeightRef.current = currentHeight;
  }, [data.chatHistory]);
  
  // style object memo
const s = useMemo(() => {
  const fontSize = { xs: isMobile ? 10 : 12, sm: isMobile ? 13 : 15, md: isMobile ? 15 : 17, lg: isMobile ? 18 : 22, xl: isMobile ? 20 : 26 };
  return {
    app: { minHeight:"100vh", background: t.bg, color:t.text, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', display:"flex", flexDirection:"column", maxWidth, margin:"0 auto", position:"relative", transition:"background 0.3s, color 0.3s", width:"100%", height:"100vh", overflow:"hidden" },
    header: { padding: headerPadding, borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, transition:"background 0.3s, border-color 0.3s", minHeight: isMobile ? (isLandscape ? "60px" : "56px") : "72px" },
    headerTitle: { fontSize: fontSize.lg, fontWeight:700, letterSpacing:"-0.3px", flex:1, color: theme==="dark" ? "transparent": t.accent, background: theme==="dark"? `linear-gradient(135deg, ${t.accent}, ${t.accent2})`:"none", WebkitBackgroundClip: theme==="dark" ? "text":"unset", WebkitTextFillColor: theme==="dark" ? "transparent":"unset" },
    content: { flex:1, padding: contentPadding, overflowY:"auto", animation:"fadeIn 0.4s ease-in", overflowX:"hidden", paddingBottom: bottomNavPadding },
    card: { background:t.card, borderRadius:12, padding:cardPadding, marginBottom:12, border:`1px solid ${t.border}`, cursor:"pointer", transition:"all 0.3s", animation:"slideUp 0.4s ease-out" },
    cardTitle: { fontSize: fontSize.md, fontWeight:600, marginBottom:6, color:t.text },
    cardText: { fontSize: fontSize.sm, color: t.textMuted, lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" },
    btn: (variant="primary") => ({ padding: isMobile ? (isLandscape ? "12px 20px" : "10px 16px") : "14px 28px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize: isMobile? fontSize.sm: fontSize.md, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s", fontFamily:"inherit", ...(variant==="primary" ? { background:t.accent, color:"#fff" } : variant==="danger" ? { background:`${t.danger}22`, color:t.danger } : variant==="ghost" ? { background:"transparent", color:t.textMuted } : { background:t.card, color:t.text, border:`1px solid ${t.border}` }) }),
    input: { width:"100%", background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding: isMobile? "10px 12px":"12px 16px", color:t.text, fontSize: fontSize.sm, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
    textarea: { width:"100%", background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:isMobile? "10px 12px":"12px 16px", color:t.text, fontSize: fontSize.sm, outline:"none", resize:"vertical", minHeight:isMobile? "120px":"200px", lineHeight:1.6, boxSizing:"border-box", fontFamily:"inherit"},
    label: { fontSize: fontSize.xs, color:t.textMuted, marginBottom:6, display:"block", fontWeight:500 },
    row: { display:"flex", gap:8, alignItems:"center" },
    section: { marginBottom:20 },
    empty: { textAlign:"center", padding: isMobile ? "60px 20px":"80px 40px", color:t.textMuted },
    categoryBadge: (color) => ({ display:"inline-block", background:`${color}33`, color:color, borderRadius:6, padding:"4px 10px", fontSize: fontSize.xs, fontWeight:500, marginRight:6, marginBottom:8, cursor:"pointer", border:`1px solid ${color}66` }),
    modal: { position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, animation:"fadeIn 0.2s ease-out", padding:"20px" },
    modalContent: { background:t.card, borderRadius:12, padding:isMobile? "20px":"28px", width:"90%", maxWidth: isMobile ? "400px":"600px", border:`1px solid ${t.border}`, animation:"slideUp 0.3s ease-out", maxHeight:"90vh", overflowY:"auto" }
  };
}, [t, theme, isMobile, isLandscape, maxWidth, headerPadding, contentPadding, cardPadding, bottomNavPadding]);

const SaveIndicator = () => {
  if (saveStatus==="idle" && !draftExists) return null;
  let statusText="", statusColor=t.textMuted;
  if (saveStatus==="saving") { statusText="💾 Сохранение..."; statusColor=t.warning }
  else if (saveStatus==="saved") { statusText="✅ Сохранено"; statusColor = t.success; }
  else if (draftExists && view !== "edit") { statusText="📝 Есть черновик"; statusColor = t.accent; }
  return <div style={{ position:"fixed", bottom:isMobile?80:100, right:20, padding:"8px 16px", borderRadius:8, background:t.surface, border:`1px solid ${statusColor}`, color:statusColor, fontSize:12, zIndex:1000 }}>{statusText}</div>;
};

const renderNotes = () => {
  if (view === "edit") {
    return <NoteEditor note={activeNote} categories={data.categories} onSave={saveNote} onCancel={() => { clearDraft(); setDraftExists(false); setView("list"); }} theme={t} s={s} allNotes={data.notes} />;
  }
  if (view === "detail") {
    return <NoteDetail note={activeNote} categories={data.categories} onEdit={()=>setView("edit")} onDelete={()=>setShowDeleteConfirm(activeNote.id)} onSummarize={()=>aiSummarize(activeNote)} aiLoading={aiLoading} theme={t} s={s} onOpenSubnote={(id)=>setSubnoteOpenId(id)} />;
  }
  return (
    <div>
      <div style={{ marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${t.border}` }}>
        <div style={{ ...s.row, marginBottom:12, justifyContent:"space-between" }}>
          <div style={{ fontSize: s.label.fontSize, fontWeight:600, color:t.textMuted }}>📂 КАТЕГОРИИ</div>
          <button style={s.btn("ghost")} onClick={()=>setShowCategoryModal(true)}><Icon d={icons.plus} size={14} /></button>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, overflowX:"auto" }}>
          <button style={{ ...s.categoryBadge(t.accent), border: activeCategory === null ? `2px solid ${t.accent}`:`1px solid ${t.accent}66`, background: activeCategory===null? `${t.accent}44`:`${t.accent}22` }} onClick={()=>setActiveCategory(null)}>Все</button>
          {data.categories.map(cat => <div key={cat.id} style={{ display:"inline-flex", alignItems:"center", gap:2, marginBottom:4 }}>
            <button style={{ ...s.categoryBadge(cat.color), border: activeCategory===cat.id?`2px solid ${cat.color}`:`1px solid ${cat.color}66`, background: activeCategory===cat.id? `${cat.color}44`:`${cat.color}22`, marginRight:0 }} onClick={()=>setActiveCategory(cat.id)}>{cat.name}</button>
            <button style={{ background:`${t.danger}22`, color:t.danger, border:`1px solid ${t.danger}44`, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:12, fontWeight:700, padding:0 }} onClick={(e)=>{ e.stopPropagation(); if(window.confirm(`Удалить категорию "${cat.name}"? Заметки станут "без категории"`)) deleteCategory(cat.id); }} title="Удалить категорию">×</button>
          </div>)}
        </div>
      </div>

      {draftExists && <div style={{ padding:"12px 16px", background:`${t.accent}22`, borderRadius:8, marginBottom:12, border:`1px solid ${t.accent}`, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:14 }}>📝 У вас есть несохраненный черновик</span>
        <div style={{ display:"flex", gap:8 }}>
          <button style={s.btn("primary")} onClick={restoreDraft}>Восстановить</button>
          <button style={s.btn("ghost")} onClick={discardDraft}>Удалить</button>
        </div>
      </div>}

      <div style={{ ...s.row, marginBottom:12, gap:12 }}>
        <div style={{ position:"relative", flex:1 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:t.textMuted }}><Icon d={icons.search} size={16} /></span>
          <input style={{ ...s.input, paddingLeft:34 }} placeholder="Поиск..." value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
        <button style={s.btn("primary")} onClick={newNote}><Icon d={icons.plus} size={16} /> {!isMobile && "Новая"}</button>
      </div>

      {filtered.length === 0 ? (
        <div style={s.empty}><div style={{ fontSize:40, marginBottom:12 }}>📝</div><div style={{ fontWeight:600, marginBottom:4 }}>Нет заметок</div><div style={{ fontSize:13 }}>{ activeCategory !== null ? "Создайте заметку в этой категории" : "Создайте первую заметку" }</div></div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, gap: isTablet?16:12 }}>
          {filtered.map(n => {
            const cat = data.categories.find(c=>c.id===n.categoryId);
            return <div key={n.id} style={s.card} onClick={()=>{ setActiveNote(n); setView("detail"); }}>
              <div style={s.cardTitle}>{n.title || "Без названия"}</div>
              <div style={s.cardText}>{n.text ? n.text.slice(0,200) : ""}</div>
              <div style={{ marginTop:8 }}>
                {cat && <span style={s.categoryBadge(cat.color)}>{cat.name}</span>}
                {n.tags && n.tags.map(tag => <span key={tag} style={{ display:"inline-block", background:`${t.accent}22`, color:t.accent, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:500, marginRight:4, marginBottom:4 }}>{tag}</span>)}
                <span style={{ fontSize:11, color:t.textMuted, float:"right", marginTop:2 }}>{new Date(n.createdAt).toLocaleDateString("ru")}</span>
              </div>
            </div>;
          })}
        </div>
      )}
    </div>
  );
};

  const renderAI = () => {
    const systemPrompt = `Ты умный ассистент приложения SmartNotes. У тебя есть доступ к заметкам и библиотеке пользователя.

Помогай искать информацию, суммировать, объяснять и создавать планы для изучения.

Отвечай кратко и по делу на русском языке.

ЗАМЕТКИ ПОЛЬЗОВАТЕЛЯ:
${notesContext || "Заметок пока нет."}

БИБЛИОТЕКА (загруженные файлы и книги):
${libraryContext || "Библиотека пуста."}`;

    const sendChat = async () => {
      const textMsg = chatInput.trim();
      if (!textMsg || chatLoading) return;
      setChatInput("");
      const userMsg = { role: "user", content: textMsg };
      const history = [...data.chatHistory, userMsg];
      persist({ ...data, chatHistory: history });
      setChatLoading(true);
      try {
        const reply = await askAI(history.map(m => ({ role:m.role, content:m.content })), systemPrompt);
        persist({ ...data, chatHistory: [...history, { role:"assistant", content: reply } ] });
      } catch(_) {
        persist({ ...data, chatHistory: [...history, { role:"assistant", content: "Ошибка соединения. Попробуйте снова." }] });
      }
      setChatLoading(false);
    };

    return (
      <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - " + (isMobile ? "180px":"200px") + ")" }}>
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, paddingBottom:8 }} ref={chatRef}>
          {data.chatHistory.length===0 && <div style={s.empty}><div style={{ fontSize:40, marginBottom:12 }}>🤖</div><div style={{ fontWeight:600, marginBottom:4 }}>ИИ-ассистент</div><div style={{ fontSize:13 }}>Я помогу вам с заметками и библиотекой. Спрашивайте что угодно!</div></div>}
          {data.chatHistory.map((m,i)=> <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end":"flex-start", paddingRight: m.role==="user"?0:8, paddingLeft: m.role==="user"?8:0 }}><div style={s.bubble(m.role==="user")}>{m.content}</div></div>)}
          {chatLoading && <div style={{ display:"flex" }}><div style={{ ...s.bubble(false), color:t.textMuted }}>Думаю...</div></div>}
        </div>
        <div style={{ ...s.row, paddingTop:8, borderTop:`1px solid ${t.border}`, paddingBottom:8, gap:12 }}>
          <input style={{ ...s.input, flex:1 }} placeholder="Спросите..." value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter" && sendChat()} disabled={chatLoading} />
          <button style={{ ...s.btn("primary"), padding:"10px 14px" }} onClick={sendChat} disabled={chatLoading}><Icon d={icons.send} size={16} /></button>
          {data.chatHistory.length>0 && <button style={s.btn("ghost")} onClick={()=>persist({ ...data, chatHistory: [] })} title="Очистить"><Icon d={icons.trash} size={16} /></button>}
        </div>
      </div>
    );
  };

  const renderLibrary = () => {
    const handleAddToLibrary = () => {
      if (libName.trim() && libContent.trim()) {
        const libraryItem = { id: Date.now(), name: libName, content: libContent, type: "file", uploadedAt: new Date().toISOString() };
        persist({ ...data, library: [...data.library, libraryItem]});
        setLibName(""); setLibContent(""); showNotification("📚 Файл добавлен в библиотеку");
      }
    };
    const deleteFromLibrary = (id) => { persist({ ...data, library: data.library.filter(it => it.id !== id) }); showNotification("🗑️ Файл удален из библиотеки"); };
    const filteredLibraryItems = filteredLibrary;
    return (
      <div>
        <div style={{ marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${t.border}` }}>
          <div style={{ ...s.row, marginBottom:12, gap:8 }}>
            <input type="text" style={{ ...s.input, flex:1 }} placeholder="Название файла..." value={libName} onChange={(e)=>setLibName(e.target.value)} />
            <button style={s.btn("primary")} onClick={handleAddToLibrary}><Icon d={icons.upload} size={16} /> {!isMobile && "Добавить"}</button>
          </div>
          <textarea style={{ ...s.textarea, marginBottom:12 }} placeholder="Вставьте содержимое..." rows={isTablet?6:4} value={libContent} onChange={(e)=>setLibContent(e.target.value)} />
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:t.textMuted }}><Icon d={icons.search} size={16} /></span>
            <input style={{ ...s.input, paddingLeft:34 }} placeholder="Поиск..." value={librarySearch} onChange={(e)=>setLibrarySearch(e.target.value)} />
          </div>
        </div>

        {filteredLibraryItems.length===0 ? <div style={s.empty}><div style={{ fontSize:40, marginBottom:12 }}>📚</div><div style={{ fontWeight:600, marginBottom:4 }}>Библиотека пуста</div><div style={{ fontSize:13 }}>Добавьте файлы для анализа</div></div> :
          <div style={{ display:"grid", gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, gap: isTablet?16:12 }}>
            {filteredLibraryItems.map(item => (
              <div key={item.id} style={s.card}>
                <div style={{ ...s.row, justifyContent:"space-between", marginBottom:8 }}>
                  <div style={s.cardTitle}>{item.name}</div>
                  <div style={s.row}>
                    <button style={s.btn("ghost")} onClick={() => { setChatInput(`Проанализируй это из библиотеки: "${item.name}"\n\n${item.content.slice(0,200)}...`); setTab("ai"); }} title="Отправить в чат"><Icon d={icons.send} size={14} /></button>
                    <button style={s.btn("danger")} onClick={()=>deleteFromLibrary(item.id)} title="Удалить"><Icon d={icons.trash} size={14} /></button>
                  </div>
                </div>
                <div style={{ ...s.cardText, display:"block" }}>{item.content.slice(0,200)}...</div>
                <div style={{ fontSize:11, color:t.textMuted, marginTop:8 }}>{new Date(item.uploadedAt).toLocaleDateString("ru")}</div>
              </div>
            ))}
          </div>
        }
      </div>
    );
  };

  const tabs = [ { id:"notes", label:"Заметки", icon:icons.note }, { id:"ai", label:"ИИ", icon:icons.ai }, { id:"library", label:"Библиотека", icon:icons.library }, { id:"quiz", label:"Тесты", icon:icons.quiz } ];
  const getTabLabel = (id) => id==="notes"?"Заметки": id==="ai"?"ИИ": id==="library"?"Библиотека":"Тесты";
  const headerTitle = tab==="notes" ? "📝 SmartNotes" : tab==="ai" ? "🤖 ИИ" : tab==="library" ? "📚 Библиотека" : "📋 Тесты";

  const subnoteTarget = data.notes.find(n=>n.id===subnoteOpenId) || null;

  return (
    <div style={s.app}>
      <style>{`
        *{ margin:0; padding:0; box-sizing:border-box; }
        html,body{ width:100%; height:100%; }
        body{ font-family:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif; background:${t.bg}; color:${t.text}; }
        input,textarea{ -webkit-user-select:text; user-select:text; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes slideInFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${t.surface}; }
        ::-webkit-scrollbar-thumb { background:${t.border}; border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:${t.textMuted}; }
        @media (orientation: landscape) { body { overflow: hidden; } }
      `}</style>

      <div style={s.header}>
        {(view !== "list" || tab !== "notes") && <button style={s.btn("ghost")} onClick={()=>{ setView("list"); setTab("notes"); }}><Icon d={icons.back} size={18} /></button>}
        <div style={s.headerTitle}>{headerTitle}</div>
        <button style={s.btn("ghost")} onClick={toggleTheme} title="Переключить тему"><Icon d={theme==="dark"?icons.sun:icons.moon} size={18} /></button>
      </div>

      <div style={s.content}>
        {tab==="notes" && renderNotes()}
        {tab==="ai" && renderAI()}
        {tab==="library" && renderLibrary()}
        {tab==="quiz" && <div style={s.empty}>📋 Раздел "Тесты" в разработке</div>}
      </div>

      {(view === "list" || tab !== "notes") && <div style={s.bottomNav}><style>{''}</style>{tabs.map(ti => <button key={ti.id} style={s.navButton ? s.navButton(tab===ti.id) : {}} onClick={()=>{ setTab(ti.id); if (ti.id==="notes") setView("list"); }}><div style={s.navIcon}><Icon d={ti.icon} size={isMobile?20:24} /></div><div style={s.navLabel}>{getTabLabel(ti.id)}</div></button>)}</div>}

      {showCategoryModal && <div style={s.modal} onClick={()=>setShowCategoryModal(false)}><div style={s.modalContent} onClick={(e)=>e.stopPropagation()}><div style={{ ...s.cardTitle, marginBottom:16 }}><Icon d={icons.folder} size={16} style={{ marginRight:6 }} /> Новая категория</div><div style={s.section}><label style={s.label}>Название</label><input style={s.input} placeholder="Например: 📚 Учёба" value={newCategoryName} onChange={(e)=>setNewCategoryName(e.target.value)} /></div><div style={s.section}><label style={s.label}>Цвет</label><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{["#6366F1", "#2DD4BF", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"].map(color => <button key={color} style={{ width:40, height:40, borderRadius:8, background:color, border: newCategoryColor===color ? `3px solid ${t.text}` : `2px solid ${t.border}`, cursor:"pointer" }} onClick={()=>setNewCategoryColor(color)} />)}</div></div><div style={{ ...s.row, justifyContent:"flex-end", gap:8 }}><button style={s.btn("ghost")} onClick={()=>setShowCategoryModal(false)}>Отмена</button><button style={s.btn("primary")} onClick={addCategory}><Icon d={icons.plus} size={16} /> Создать</button></div></div></div>}

      {showDeleteConfirm && <div style={s.modal} onClick={()=>setShowDeleteConfirm(null)}><div style={s.modalContent} onClick={(e)=>e.stopPropagation()}><div style={{ ...s.cardTitle, marginBottom:16, color:t.danger }}>⚠️ Подтвердите удаление</div><div style={{ marginBottom:20, fontSize:14, color:t.text }}>Вы уверены, что хотите удалить заметку <strong>"{activeNote?.title || "Без названия"}"</strong>?<br /><span style={{ color:t.textMuted, fontSize:12, marginTop:8 }}>Это действие нельзя отменить.</span></div><div style={{ ...s.row, justifyContent:"flex-end", gap:8 }}><button style={s.btn("ghost")} onClick={()=>setShowDeleteConfirm(null)}>Отмена</button><button style={s.btn("danger")} onClick={()=>deleteNote(showDeleteConfirm)}><Icon d={icons.trash} size={16} /> Удалить</button></div></div></div>}

      <SaveIndicator />

      {/* Subnote overlay (slide-in) */}
      {subnoteOpenId && <SubnoteOverlay note={subnoteTarget} onClose={() => setSubnoteOpenId(null)} theme={t} s={s} />}

    </div>
  );
}
