/* App.jsx — исправлена отрисовка превью, видимость иконки темы, нижняя панель */
import { useState, useEffect, useRef, useMemo } from "react";
import mammoth from "mammoth";
const colorSchemes = {
  warm: {
    label: "Тёплая терракота",
    swatch: "#C4622D",
    dark: {
      bg: "#211C17",
      surface: "#2A241D",
      card: "#332C23",
      border: "#463C30",
      text: "#F5EFE6",
      textMuted: "#B3A594",
      accent: "#D97847",
      accent2: "#5A9178",
      success: "#5A9178",
      warning: "#D6A24C",
      danger: "#C15B4A",
      shadow: "42,36,29",
    },
    light: {
      bg: "#FAF7F2",
      surface: "#F3EEE5",
      card: "#FFFFFF",
      border: "#E8E4DC",
      text: "#3A3633",
      textMuted: "#7A746C",
      accent: "#C4622D",
      accent2: "#2D6A4F",
      success: "#2D6A4F",
      warning: "#C4622D",
      danger: "#9C3848",
      shadow: "42,36,29",
    },
  indigo: {
    label: "Сине-фиолетовая",
    swatch: "#6366F1",
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
      shadow: "5,7,12",
    },
    light: {
      bg: "#F5F6FC",
      surface: "#ECEEFB",
      card: "#FFFFFF",
      border: "#DBDFF5",
      text: "#232538",
      textMuted: "#65688A",
      accent: "#6366F1",
      accent2: "#1a7f64",
      success: "#1a7f64",
      warning: "#D29922",
      danger: "#DA3633",
      shadow: "20,20,40",
  },
  forest: {
    label: "Лесная зелень",
    swatch: "#3E8E5B",
    dark: {
      bg: "#131A15",
      surface: "#1A231C",
      card: "#212C23",
      border: "#2C3A2E",
      text: "#E8F0E9",
      textMuted: "#94A896",
      accent: "#57B37E",
      accent2: "#7FAE6B",
      success: "#57B37E",
      warning: "#D6A24C",
      danger: "#C15B4A",
      shadow: "10,16,12",
    },
    light: {
      bg: "#F5F9F3",
      surface: "#EAF2E6",
      card: "#FFFFFF",
      border: "#DAE8D5",
      text: "#28322A",
      textMuted: "#6B7C6C",
      accent: "#3E8E5B",
      accent2: "#5C8F3F",
      success: "#3E8E5B",
      warning: "#B8863A",
      danger: "#A6483D",
      shadow: "22,32,26",
  },
  ocean: {
    label: "Океан",
    swatch: "#2E7DAF",
    dark: {
      bg: "#0E1A22",
      surface: "#14232D",
      card: "#1B2E3A",
      border: "#254050",
      text: "#E4F1F7",
      textMuted: "#8FA9B5",
      accent: "#4EA0D6",
      accent2: "#3FBFB0",
      success: "#3FBFB0",
      warning: "#D6A24C",
      danger: "#D06A6A",
      shadow: "8,16,22",
    },
    light: {
      bg: "#F1F8FB",
      surface: "#E4F1F6",
      card: "#FFFFFF",
      border: "#D2E7EE",
      text: "#1E323C",
      textMuted: "#5E7A87",
      accent: "#2E7DAF",
      accent2: "#1C8577",
      success: "#1C8577",
      warning: "#C48A2E",
      danger: "#B5504A",
      shadow: "18,30,38",
    },
};
            berry: {
    label: "Ягодная",
    swatch: "#B23A6B",
    dark: {
      bg: "#1E1218",
      surface: "#271821",
      card: "#31202B",
      border: "#432A38",
      text: "#F5E9EF",
      textMuted: "#B296A3",
      accent: "#D5588A",
      accent2: "#8E6FC2",
      success: "#5A9178",
      warning: "#D6A24C",
      danger: "#C1524F",
      shadow: "18,10,15",
    },
    light: {
      bg: "#FBF3F6",
      surface: "#F5E8EE",
      card: "#FFFFFF",
      border: "#EBD6E0",
      text: "#3A2530",
      textMuted: "#8A6E7A",
      accent: "#B23A6B",
      accent2: "#6E5296",
      success: "#2D6A4F",
      warning: "#C4622D",
      danger: "#9C3848",
      shadow: "36,20,28",
  },
  slate: {
    label: "Графитовая",
    swatch: "#5B6472",
    dark: {
      bg: "#16181C",
      surface: "#1E2126",
      card: "#262A30",
      border: "#363B42",
      text: "#EAECEF",
      textMuted: "#9BA3AD",
      accent: "#8A93A3",
      accent2: "#5A9178",
      success: "#5A9178",
      warning: "#D6A24C",
      danger: "#C15B4A",
      shadow: "10,11,13",
    },
    light: {
      bg: "#F5F6F7",
      surface: "#EAEBED",
      card: "#FFFFFF",
      border: "#DBDEE2",
      text: "#282B2F",
      textMuted: "#6C7379",
      accent: "#5B6472",
      accent2: "#2D6A4F",
      success: "#2D6A4F",
      warning: "#B8863A",
      danger: "#9C3848",
      shadow: "22,24,28",
  },
};

function buildThemes(schemeId) {
  const scheme = colorSchemes[schemeId] || colorSchemes.warm;
  return {
    dark: scheme.dark,
    light: scheme.light,
  };
}

const FONT_FAMILIES = {
  system: {
    label: "Системный",
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  },
  serif: {
    label: "Классический (с засечками)",
    stack: 'Georgia, "Times New Roman", serif',
  },
  rounded: {
    label: "Скруглённый",
    stack: '"Nunito", "Segoe UI Rounded", system-ui, sans-serif',
  },
  mono: {
    label: "Моноширинный",
    stack: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },
};

const STORAGE_KEY = "smartnotes_v3";
const DRAFT_KEY = "smartnotes_draft";
const QUIZ_DRAFT_KEY = "smartnotes_quiz_draft";
const SCROLL_POSITION_KEY = "smartnotes_scroll";
        /* ---- helpers for annotations, migration, storage --- */

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

    if (a.start < start) {
      result.push({ ...a, end: start });
    }

    if (a.end > end) {
      result.push({ ...a, start: end });
    }
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
    const rightPart = a.end > editPos + removedLength
      ? { ...a, start: editPos + delta, end: a.end + delta }
      : null;

    if (leftPart && leftPart.end > leftPart.start) res.push(leftPart);
    if (rightPart && rightPart.end > rightPart.start) res.push(rightPart);
  }

  return normalizeAnnotations(res);
}

function getAnnotatedFragments(text = "", annotations = []) {
  if (!text) return [];

  const anns = (annotations || [])
    .slice()
    .filter((a) => a.end > a.start && a.start < text.length && a.end > 0);

  anns.forEach((a) => {
    a.start = Math.max(0, Math.min(a.start, text.length));
    a.end = Math.max(0, Math.min(a.end, text.length));
  });

  const boundaries = new Set([0, text.length]);

  anns.forEach((a) => {
    boundaries.add(a.start);
    boundaries.add(a.end);
  });

  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  const fragments = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i];
    const e = sorted[i + 1];

    if (s === e) continue;

    const segText = text.slice(s, e);
    const segAnns = anns.filter((a) => a.start < e && a.end > s);

    fragments.push({
      text: segText,
      start: s,
      end: e,
      annotations: segAnns,
    });
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
          { id: 1, name: "📚 Учёба", color: "#C4622D" },
          { id: 2, name: "💼 Работа", color: "#2D6A4F" },
          { id: 3, name: "🎯 Личное", color: "#9C6B30" },
        ],
        quizzes: [],
        checklists: [],
        chatHistory: [],
        library: [],
        theme: "light",
        colorScheme: "warm",
        fontScale: 1,
        fontFamily: "system",
        aiModel: "llama3.2",
        workouts: [],
        workoutTemplates: [],
        events: [],
        eventTemplates: [],
        dailyLogs: {},
        activeWidgets: [],
        hiddenTabs: [],
      };

      const data = { ...base, ...parsed };
      if (!Array.isArray(data.workouts)) data.workouts = [];
      if (!Array.isArray(data.workoutTemplates)) data.workoutTemplates = [];
      if (!Array.isArray(data.events)) data.events = [];
      if (!Array.isArray(data.eventTemplates)) data.eventTemplates = [];
      if (!data.dailyLogs || typeof data.dailyLogs !== "object") data.dailyLogs = {};
      if (!Array.isArray(data.activeWidgets)) data.activeWidgets = [];
      if (!Array.isArray(data.hiddenTabs)) data.hiddenTabs = [];
      if (!Array.isArray(data.checklists)) data.checklists = [];
      data.checklists = data.checklists.map((c) => {
        const normItem = (it) => ({
          id: it.id,
          text: it.text || "",
          timerMinutes: typeof it.timerMinutes === "number" ? it.timerMinutes : null,
          timerSeconds:
            typeof it.timerSeconds === "number"
              ? Math.min(59, Math.max(0, it.timerSeconds))
              : 0,
          done: !!it.done,
        });

        const normGroups = (arr) =>
          Array.isArray(arr)
            ? arr.map((g) => ({
                id: g.id,
                title: g.title || "Блок",
                icon: g.icon || "🔹",
                items: Array.isArray(g.items) ? g.items.map(normItem) : [],
              }))
            : [];

        const days =
          Array.isArray(c.days) && c.days.length ? c.days : [0, 1, 2, 3, 4, 5, 6];

        let perDay = !!c.perDay;
        let contentByDay = {};
        let sharedGroups = [];

        if (c.contentByDay && typeof c.contentByDay === "object") {
          perDay = true;
          for (const dayIdx of Object.keys(c.contentByDay)) {
            contentByDay[dayIdx] = normGroups(c.contentByDay[dayIdx]);
          }
        } else if (Array.isArray(c.groups) && c.groups.length) {
          sharedGroups = normGroups(c.groups);
          perDay = false;
        } else if (Array.isArray(c.items)) {
          sharedGroups = [
            {
              id: `grp_${c.id}_default`,
              title: "Задачи",
              icon: c.icon || "✅",
              items: c.items.map(normItem),
            },
          ];
          perDay = false;
        }

        return {
          id: c.id,
          title: c.title || "Без названия",
          type: c.type === "habit" ? "habit" : "once",
          icon: c.icon || "✅",
          days,
          perDay,
          groups: sharedGroups,
          contentByDay,
          progressByDate:
            c.progressByDate && typeof c.progressByDate === "object"
              ? c.progressByDate
              : {},
          createdAt: c.createdAt || Date.now(),
        };
      });

      data.notes = (data.notes || []).map((n) => {
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

          return {
            ...n,
            text,
            annotations,
            tags: n.tags || [],
            categoryId: n.categoryId ?? null,
          };
        }

        if (n.body) {
          return {
            ...n,
            text: n.body,
            annotations: [],
            tags: n.tags || [],
            categoryId: n.categoryId ?? null,
          };
        }

        return {
          ...n,
          text: "",
          annotations: [],
          tags: n.tags || [],
          categoryId: n.categoryId ?? null,
        };
      });

      return data;
    }
  } catch (_) {}

  return {
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
    theme: "light",
    colorScheme: "warm",
    fontScale: 1,
    fontFamily: "system",
    aiModel: "llama3.2",
    workouts: [],
    workoutTemplates: [],
    events: [],
    eventTemplates: [],
    dailyLogs: {},
    activeWidgets: [],
    hiddenTabs: [],
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

function loadQuizDraft() {
  try {
    const raw = localStorage.getItem(QUIZ_DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  return null;
}

function saveQuizDraft(quizDraft) {
  try {
    localStorage.setItem(QUIZ_DRAFT_KEY, JSON.stringify(quizDraft));
  } catch (_) {}
}

function clearQuizDraft() {
  try {
    localStorage.removeItem(QUIZ_DRAFT_KEY);
  } catch (_) {}
}

function saveScrollPosition(noteId, position) {
  try {
    localStorage.setItem(`${SCROLL_POSITION_KEY}_${noteId}`, String(position));
  } catch (_) {}
}

function loadScrollPosition(noteId) {
  try {
    const pos = localStorage.getItem(`${SCROLL_POSITION_KEY}_${noteId}`);
    const p = pos ? parseInt(pos, 10) : 0;
    return Number.isNaN(p) ? 0 : p;
  } catch (_) {}

  return 0;
      }
        /* -----------------------
   Minimal ZIP writer (STORE, no compression) + DOCX export
   ----------------------- */

const CRC_TABLE = (() => {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function strToBytes(str) {
  return new TextEncoder().encode(str);
}

function writeUint32LE(view, offset, value) {
  view.setUint32(offset, value, true);
}

function writeUint16LE(view, offset, value) {
  view.setUint16(offset, value, true);
}

// Builds a valid (uncompressed / STORE) ZIP file from [{name, data(Uint8Array)}]
function buildZip(files) {
  const fileRecords = [];
  let offset = 0;
  const localParts = [];

  files.forEach((file) => {
    const nameBytes = strToBytes(file.name);
    const data = file.data;
    const crc = crc32(data);

    const localHeader = new ArrayBuffer(30);
    const lv = new DataView(localHeader);
    writeUint32LE(lv, 0, 0x04034b50);
    writeUint16LE(lv, 4, 20);
    writeUint16LE(lv, 6, 0);
    writeUint16LE(lv, 8, 0);
    writeUint16LE(lv, 10, 0);
    writeUint16LE(lv, 12, 0);
    writeUint32LE(lv, 14, crc);
    writeUint32LE(lv, 18, data.length);
    writeUint32LE(lv, 22, data.length);
    writeUint16LE(lv, 26, nameBytes.length);
    writeUint16LE(lv, 28, 0);

    localParts.push(new Uint8Array(localHeader), nameBytes, data);

    fileRecords.push({
      nameBytes,
      crc,
      size: data.length,
      offset,
    });

    offset += 30 + nameBytes.length + data.length;
  });
    const centralParts = [];
  let centralSize = 0;

  fileRecords.forEach((rec) => {
    const centralHeader = new ArrayBuffer(46);
    const cv = new DataView(centralHeader);
    writeUint32LE(cv, 0, 0x02014b50);
    writeUint16LE(cv, 4, 20);
    writeUint16LE(cv, 6, 20);
    writeUint16LE(cv, 8, 0);
    writeUint16LE(cv, 10, 0);
    writeUint16LE(cv, 12, 0);
    writeUint16LE(cv, 14, 0);
    writeUint32LE(cv, 16, rec.crc);
    writeUint32LE(cv, 20, rec.size);
    writeUint32LE(cv, 24, rec.size);
    writeUint16LE(cv, 28, rec.nameBytes.length);
    writeUint16LE(cv, 30, 0);
    writeUint16LE(cv, 32, 0);
    writeUint16LE(cv, 34, 0);
    writeUint16LE(cv, 36, 0);
    writeUint32LE(cv, 38, 0);
    writeUint32LE(cv, 42, rec.offset);

    centralParts.push(new Uint8Array(centralHeader), rec.nameBytes);
    centralSize += 46 + rec.nameBytes.length;
  });

  const centralOffset = offset;

  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  writeUint32LE(ev, 0, 0x06054b50);
  writeUint16LE(ev, 4, 0);
  writeUint16LE(ev, 6, 0);
  writeUint16LE(ev, 8, files.length);
  writeUint16LE(ev, 10, files.length);
  writeUint32LE(ev, 12, centralSize);
  writeUint32LE(ev, 16, centralOffset);
  writeUint16LE(ev, 20, 0);

  const allParts = [...localParts, ...centralParts, new Uint8Array(eocd)];
  const totalLen = allParts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  allParts.forEach((p) => {
    result.set(p, pos);
    pos += p.length;
  });

  return result;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateDocx(title, bodyText) {
  const paragraphs = (bodyText || "").split(/\r?\n/);

  const titleXml = title
    ? `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(title)}</w:t></w:r></w:p>`
    : "";

  const bodyXml = paragraphs
    .map((line) =>
      line.trim()
        ? `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`
        : `<w:p/>`
    )
    .join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${titleXml}
${bodyXml}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417"/></w:sectPr>
</w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  const files = [
    { name: "[Content_Types].xml", data: strToBytes(contentTypesXml) },
    { name: "_rels/.rels", data: strToBytes(relsXml) },
    { name: "word/document.xml", data: strToBytes(documentXml) },
    { name: "word/_rels/document.xml.rels", data: strToBytes(docRelsXml) },
  ];

  return buildZip(files);
}

function downloadBlob(bytesOrString, filename, mimeType) {
  const blob =
    typeof bytesOrString === "string"
      ? new Blob([bytesOrString], { type: mimeType })
      : new Blob([bytesOrString], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportNoteAsFile(note, format) {
  const safeTitle = (note.title || "Без названия").replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);

  if (format === "docx") {
    const bytes = generateDocx(note.title || "Без названия", note.text || "");
    downloadBlob(
      bytes,
      `${safeTitle}.docx`,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  } else {
    const content = `${note.title || "Без названия"}\n\n${note.text || ""}`;
    downloadBlob(content, `${safeTitle}.txt`, "text/plain;charset=utf-8");
  }
  }
        async function askAI(messages, systemPrompt) {
  const userMessage = messages[messages.length - 1]?.content || "";

  try {
    const body = {
      model: "mistralai/mistral-7b-instruct:free",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 500,
    };

    const fetchOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };

    if (
      typeof AbortSignal !== "undefined" &&
      typeof AbortSignal.timeout === "function"
    ) {
      fetchOptions.signal = AbortSignal.timeout(15000);
    }

    const apiKey =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.REACT_APP_OPENROUTER_KEY) ||
      null;

    if (apiKey) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${apiKey}`,
      };
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      fetchOptions
    );

    if (response && response.ok) {
      const data = await response.json();

      return (
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text ||
        "Извините, не удалось получить ответ."
      );
    }
  } catch (err) {
    console.log("AI error:", err);
  }

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

  for (const [key, value] of Object.entries(fallbackResponses)) {
    if (userMessage.toLowerCase().includes(key)) return value;
  }

  return `Спасибо за вопрос: "${userMessage}"\n\nЯ помогу вам организовать информацию.`;
}

/* Icon & icons */

const Icon = ({ d, size = 20, color = "currentColor", ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
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
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  back: "M19 12H5M12 5l-7 7 7 7",
  sun: "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9zm-9-10v2m0 16v2m9-9h-2m-16 0H2m15.66-6.66l-1.41 1.41M6.75 6.75L5.34 5.34M21.66 18.66l-1.41-1.41M6.75 17.25l-1.41 1.41",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  menu: "M3 12h18M3 6h18M3 18h18",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  help: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  chevronRight: "M9 18l6-6-6-6",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  type: "M4 7V4h16v3 M9 20h6 M12 4v16",
  textSize: "M4 20V4 M4 4h6 M4 12h4 M14 20l4-16 4 16 M15.5 15h5",
  copy: "M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8.5L16.5 4H10a2 2 0 0 0-2 2z M16 4v4h4",
  sport: "M13 3l-8 9h6l-1 9 8-9h-6l1-9z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
};
        /* -----------------------
   Subnote overlay (read-only)
   ----------------------- */

function SubnoteOverlay({ note, onClose, theme: t, s }) {
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
        background: t.card,
        borderLeft: `1px solid ${t.border}`,
        zIndex: 2000,
        boxShadow: `-20px 0 40px rgba(${t.shadow}, 0.25)`,
        animation: "slideInFromRight 0.28s ease",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: 18,
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: t.text }}>
          {note.title || "Без названия"}
        </div>

        <button style={{ ...s.btn("ghost") }} onClick={onClose}>
          ✕
        </button>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: 12,
          }}
        >
          {fragments.map((frag, idx) => {
            const colorAnn = frag.annotations.find((a) => a.type === "color");

            const style = {
              background: colorAnn ? colorAnn.value : "transparent",
              padding: colorAnn ? "2px 4px" : undefined,
              borderRadius: colorAnn ? 4 : undefined,
              color: t.text,
            };

            return (
              <span key={idx} style={style}>
                {frag.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
        /* -----------------------
   NoteEditor (textarea only)
   ----------------------- */

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

    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }

    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const oldValue = prevTextRef.current || "";

    if (newValue === oldValue) {
      setText(newValue);
      prevTextRef.current = newValue;
      return;
    }

    let start = 0;

    while (
      start < oldValue.length &&
      start < newValue.length &&
      oldValue[start] === newValue[start]
    ) {
      start++;
    }

    let oldEnd = oldValue.length - 1;
    let newEnd = newValue.length - 1;

    while (
      oldEnd >= start &&
      newEnd >= start &&
      oldValue[oldEnd] === newValue[newEnd]
    ) {
      oldEnd--;
      newEnd--;
    }

    const removedLength = oldEnd >= start ? oldEnd - start + 1 : 0;
    const insertedLength = newEnd >= start ? newEnd - start + 1 : 0;

    const updatedAnnotations = adjustAnnotationsForEdit(
      annotations,
      start,
      removedLength,
      insertedLength
    );

    setAnnotations(updatedAnnotations);
    setText(newValue);
    prevTextRef.current = newValue;
  };
  const applyColor = (value) => {
  const ta = textareaRef.current;

  if (!ta) return;

  const start = ta.selectionStart;
  const end = ta.selectionEnd;

  if (start === end) return;

  const newAnns = applyAnnotation(annotations, start, end, "color", value, text.length);

  setAnnotations(newAnns);
  setSelectedColor(value);

  setTimeout(() => {
    try {
      ta.selectionStart = end;
      ta.selectionEnd = end;
      ta.focus();
    } catch (_) {}
  }, 0);
};

const openSubnotePicker = () => setShowSubnotePicker(true);

const addSubnoteToSelection = (targetNoteId) => {
  const ta = textareaRef.current;

  if (!ta) return;

  const start = ta.selectionStart;
  const end = ta.selectionEnd;

  if (start === end) return;

  const newAnns = applyAnnotation(
    annotations,
    start,
    end,
    "subnote",
    targetNoteId,
    text.length
  );

  setAnnotations(newAnns);
  setShowSubnotePicker(false);

  setTimeout(() => {
    try {
      ta.selectionStart = end;
      ta.selectionEnd = end;
      ta.focus();
    } catch (_) {}
  }, 0);
};

useEffect(() => {
  saveDraft({ ...note, title, text, annotations, tags, categoryId });
}, [title, text, annotations, tags, categoryId, note]);

const isNewEmptyNote = !note.title && !note.text;

const handleImportFile = async (file) => {
  if (!file) return;
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".txt")) {
    const content = await file.text();
    setText((prev) => (prev ? `${prev}\n${content}` : content));
  } else if (lower.endsWith(".docx")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setText((prev) => (prev ? `${prev}\n${result.value || ""}` : result.value || ""));
    } catch (e) {
      window.alert("Не удалось прочитать .docx файл.");
    }
  } else {
    window.alert("Поддерживаются форматы .txt и .docx");
  }
};
    return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <div style={s.section}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={s.label}>Название</label>
          {isNewEmptyNote && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  ...s.btn("ghost"),
                  padding: "4px 10px",
                  fontSize: 12,
                  pointerEvents: "none",
                }}
              >
                <Icon d={icons.upload} size={14} color={t.text} /> Импорт
              </div>
              <input
                type="file"
                accept=".txt,.docx"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
                onChange={(e) => {
                  handleImportFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          )}
        </div>

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
    onChange={(e) =>
      setCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)
    }
  >
    <option value="">Без категории</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: t.textMuted }}>Выделить цветом:</span>

        {colors.map((c) => (
          <button
            key={c.value}
            title={c.name}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: c.value,
              border:
                selectedColor === c.value
                  ? "2px solid #fff"
                  : "1px solid rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
            onClick={() => applyColor(c.value)}
          />
        ))}

        <button style={s.btn("secondary")} onClick={openSubnotePicker}>
          🔗 Добавить подзаметку
        </button>

        <button
          style={s.btn("ghost")}
          onClick={() => {
            const ta = textareaRef.current;

            if (!ta) return;

            const sidx = ta.selectionStart;
            const eidx = ta.selectionEnd;

            if (sidx === eidx) return;

            const remaining = annotations.filter(
              (a) => !(a.type === "color" && a.start < eidx && a.end > sidx)
            );

            setAnnotations(normalizeAnnotations(remaining));
          }}
        >
          ✖ Сбросить
        </button>
      </div>

      <div style={s.section}>
        <label style={s.label}>Содержание</label>

        <textarea
          ref={textareaRef}
          style={{ ...s.textarea, minHeight: "300px", fontSize: 16, lineHeight: 1.8 }}
          placeholder="Запишите всё, что хотите сохранить..."
          value={text}
          onChange={handleTextChange}
          rows={10}
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

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tags.map((tg) => (
            <span
              key={tg}
              onClick={() => removeTag(tg)}
              style={{
                background: `${t.accent}33`,
                color: t.accent,
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {tg} ×
            </span>
          ))}
        </div>
      </div>

      <div style={{ ...s.row, justifyContent: "flex-end", gap: 8, paddingBottom: 20 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>Отмена</button>

        <button
          style={s.btn("primary")}
          onClick={() =>
            onSave({
              ...note,
              title,
              text,
              annotations: normalizeAnnotations(annotations),
              tags,
              categoryId,
            })
          }
        >
          ✓ Сохранить
        </button>
      </div>

      {showSubnotePicker && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowSubnotePicker(false)}
        >
          <div
            style={{
              width: "90%",
              maxWidth: 700,
              background: t.card,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 700 }}>Выберите заметку для подзаметки</div>

              <button style={s.btn("ghost")} onClick={() => setShowSubnotePicker(false)}>
                ✕
              </button>
            </div>

            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {allNotes.filter((n) => n.id !== note.id).length === 0 && (
                <div style={{ color: t.textMuted }}>Нет других заметок</div>
              )}

              {allNotes
                .filter((n) => n.id !== note.id)
                .map((n) => (
                  <div
                    key={n.id}
                    onClick={() => addSubnoteToSelection(n.id)}
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      cursor: "pointer",
                      border: `1px solid ${t.border}`,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: t.text }}>
                      {n.title || "Без названия"}
                    </div>

                    <div style={{ color: t.textMuted, fontSize: 13 }}>
                      {(n.text || "").slice(0, 200)}
                      {(n.text || "").length > 200 ? "..." : ""}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
        /* -----------------------
   NoteDetail: preview style fixed
   ----------------------- */

function NoteDetail({
  note,
  categories,
  onEdit,
  onDelete,
  onSummarize,
  aiLoading,
  theme: t,
  s,
  onOpenSubnote,
  isTablet,
  isLandscape,
}) {
  const contentRef = useRef(null);
  const cat = categories.find((c) => c.id === note.categoryId);
  const text = note.text || "";
  const annotations = note.annotations || [];
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const savedPos = loadScrollPosition(note.id);
      contentRef.current.scrollTop = savedPos;
    }
  }, [note.id]);

  const handleScroll = () => {
    if (contentRef.current) {
      saveScrollPosition(note.id, contentRef.current.scrollTop);
    }
  };

  const fragments = getAnnotatedFragments(text, annotations);

  const previewStyle = {
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: 14,
    whiteSpace: "pre-wrap",
    overflowY: "visible",
    fontSize: isTablet ? 18 : 16,
    lineHeight: 1.8,
    color: t.text,
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ color: t.textMuted, fontSize: 12 }}>
          {new Date(note.createdAt).toLocaleString("ru")}
        </div>

        <div style={{ ...s.row, position: "relative" }}>
          <button style={s.btn("ghost")} onClick={onEdit}>
            <Icon d={icons.edit} size={16} color={t.text} />
          </button>

          <button
            style={s.btn("ghost")}
            onClick={() => setExportMenuOpen((v) => !v)}
            title="Экспорт"
          >
            <Icon
              d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
              size={16}
              color={t.text}
            />
          </button>

          {exportMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                right: 40,
                background: t.card,
                border: `1.5px solid ${t.border}`,
                borderRadius: 12,
                boxShadow: `0 8px 20px rgba(${t.shadow}, 0.25)`,
                zIndex: 50,
                overflow: "hidden",
                minWidth: 140,
              }}
            >
              <button
                onClick={() => {
                  exportNoteAsFile(note, "txt");
                  setExportMenuOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  color: t.text,
                }}
              >
                Как .txt
              </button>
              <button
                onClick={() => {
                  exportNoteAsFile(note, "docx");
                  setExportMenuOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  borderTop: `1px solid ${t.border}`,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  color: t.text,
                }}
              >
                Как .docx
              </button>
            </div>
          )}

          <button style={s.btn("danger")} onClick={onDelete}>
            <Icon d={icons.trash} size={16} color={t.danger} />
          </button>
        </div>
      </div>

      {cat && <div style={s.categoryBadge(cat.color)}>{cat.name}</div>}

      <h2
        style={{
          fontSize: isTablet ? 24 : 20,
          fontWeight: 700,
          marginBottom: 12,
          color: t.text,
        }}
      >
        {note.title || "Без названия"}
      </h2>

      <div ref={contentRef} onScroll={handleScroll} style={previewStyle}>
        {fragments.map((frag, idx) => {
          const colorAnn = frag.annotations.find((a) => a.type === "color");
          const subAnn = frag.annotations.find((a) => a.type === "subnote");

          const style = {
            background: colorAnn ? colorAnn.value : "transparent",
            padding: colorAnn ? "2px 4px" : undefined,
            borderRadius: colorAnn ? 4 : undefined,
            color: subAnn ? t.accent : t.text,
            textDecoration: subAnn ? "underline" : "none",
            cursor: subAnn ? "pointer" : "default",
          };

          if (subAnn) {
            return (
              <span
                key={idx}
                style={style}
                onClick={() => onOpenSubnote && onOpenSubnote(subAnn.value)}
              >
                {frag.text}
              </span>
            );
          }

          return (
            <span key={idx} style={style}>
              {frag.text}
            </span>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          style={s.btn("secondary")}
          onClick={() => {
            onSummarize();
          }}
          disabled={aiLoading}
        >
          <Icon d={icons.star} size={16} color={t.accent} />{" "}
          {aiLoading ? "Анализирую..." : "ИИ-резюме"}
        </button>
      </div>
    </div>
  );
            }
        /* -----------------------
   Smart Parse: import quiz questions from raw text
   ----------------------- */

function stripMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .trim();
}

function detectSections(lines) {
  const sectionRe = /^([^:]{2,60}):\s*(?:вопрос[а-я]*\s*)?(\d+)\s*[-–—]\s*(\d+)/i;
  const sections = [];

  lines.forEach((line, idx) => {
    const m = line.trim().match(sectionRe);
    if (m) {
      sections.push({
        name: m[1].trim(),
        from: parseInt(m[2], 10),
        to: parseInt(m[3], 10),
        lineIdx: idx,
      });
    }
  });

  return sections;
}

function splitIntoQuestionBlocks(text) {
  const lines = text.split(/\r?\n/);
  const qStartRe = /^\s*(\d{1,4})[.)]\s+(.*)/;

  const blocks = [];
  let current = null;

  lines.forEach((rawLine) => {
    const line = rawLine.replace(/\s+$/, "");
    const m = line.match(qStartRe);

    if (m) {
      if (current) blocks.push(current);
      current = { num: parseInt(m[1], 10), lines: [m[2]] };
    } else if (current) {
      current.lines.push(line);
    }
  });

  if (current) blocks.push(current);

  return blocks;
}

const OPTION_RE = /^\s*([a-zA-Zа-яА-ЯёЁ])[.)]\s+(.*)|^\s*[-•]\s+(.*)/;
const CORRECT_MARK_RE = /\*\s*$|✓\s*$|\(правильн\w*\)\s*$|\[верно\]\s*$/i;

function parseQuestionBlock(lines) {
  const optionLines = [];
  const questionLines = [];
  let seenOption = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const m = trimmed.match(OPTION_RE);
    if (m) {
      seenOption = true;
      optionLines.push(trimmed);
    } else if (!seenOption) {
      questionLines.push(trimmed);
    } else {
      if (optionLines.length > 0) {
        optionLines[optionLines.length - 1] += " " + trimmed;
      }
    }
  });

  const questionText = stripMd(questionLines.join(" ").trim());

  const options = [];
  const correctIndexes = [];

  optionLines.forEach((line, idx) => {
    const m = line.match(OPTION_RE);
    let body = m ? (m[2] !== undefined ? m[2] : m[3]) : line;

    let isCorrect = false;
    if (CORRECT_MARK_RE.test(body)) {
      isCorrect = true;
      body = body.replace(CORRECT_MARK_RE, "").trim();
    }
    if (/\*\*(.+)\*\*/.test(body)) {
      isCorrect = true;
    }

    body = stripMd(body);

    options.push({ id: `opt_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`, text: body });
    if (isCorrect) correctIndexes.push(idx);
  });

  return { questionText, options, correctIndexes };
}

function parseAnswerKey(text) {
  const keyBlockRe = /(?:ответы|ключ ответов|правильные ответы)\s*:?\s*([\s\S]+)$/i;
  const m = text.match(keyBlockRe);
  if (!m) return {};

  const body = m[1];
  const pairRe = /(\d{1,4})\s*[-.):]\s*([a-zA-Zа-яА-ЯёЁ]+)/g;
  const map = {};
  let pm;

  while ((pm = pairRe.exec(body)) !== null) {
    const qNum = parseInt(pm[1], 10);
    const letters = pm[2].toLowerCase().split("");
    map[qNum] = letters;
  }

  return map;
}

function letterToIndex(letter) {
  const alphabetRu = "абвгдежзийклмнопрстуфхцчшщъыьэюя";
  const alphabetEn = "abcdefghijklmnopqrstuvwxyz";
  let idx = alphabetRu.indexOf(letter);
  if (idx === -1) idx = alphabetEn.indexOf(letter);
  return idx;
}

function smartParseQuiz(rawText) {
  const text = rawText.replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  const sections = detectSections(lines);
  const answerKey = parseAnswerKey(text);
  const blocks = splitIntoQuestionBlocks(text);

  const questions = blocks.map((block, i) => {
    const { questionText, options, correctIndexes } = parseQuestionBlock(block.lines);

    let finalCorrect = correctIndexes;
    if (finalCorrect.length === 0 && answerKey[block.num]) {
      finalCorrect = answerKey[block.num]
        .map(letterToIndex)
        .filter((idx) => idx >= 0 && idx < options.length);
    }

    return {
      id: `q_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      num: block.num,
      text: questionText || `Вопрос ${block.num}`,
      options,
      correctOptionIds: finalCorrect.map((idx) => options[idx]?.id).filter(Boolean),
      multiple: finalCorrect.length > 1,
    };
  }).filter((q) => q.options.length >= 2);

  const sectionsResolved = sections.map((sec) => ({
    id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: sec.name,
    questionIds: questions
      .filter((q) => q.num >= sec.from && q.num <= sec.to)
      .map((q) => q.id),
  })).filter((sec) => sec.questionIds.length > 0);

  return {
    questions,
    sections: sectionsResolved,
    hasSections: sectionsResolved.length > 1,
  };
}

      /* -----------------------
   Checklists: editor + detail
   ----------------------- */

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function todayWeekday() {
  return (new Date().getDay() + 6) % 7;
}

function getMonday(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKeyFor(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function weekLabel(monday) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmt = (d) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(monday)}–${fmt(sunday)}`;
}

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyGroup(n) {
  return {
    id: makeId("grp"),
    title: `Блок ${n}`,
    icon: "🔹",
    items: [{ id: makeId("it"), text: "", timerMinutes: null, timerSeconds: 0, done: false }],
  };
}

/* -----------------------
   Checklist Editor
   ----------------------- */

function ChecklistEditor({ checklist, onSave, onCancel, theme: t, s }) {
  const [title, setTitle] = useState(checklist?.title || "");
  const [type, setType] = useState(checklist?.type || "habit");
  const [icon, setIcon] = useState(checklist?.icon || "✅");
  const [days, setDays] = useState(
    checklist?.days && checklist.days.length ? checklist.days : [0, 1, 2, 3, 4, 5, 6]
  );
  const [perDay, setPerDay] = useState(!!checklist?.perDay);

  const [sharedGroups, setSharedGroups] = useState(
    checklist && !checklist.perDay && checklist.groups?.length
      ? checklist.groups.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it })) }))
      : [emptyGroup(1)]
  );

  const [contentByDay, setContentByDay] = useState(() => {
    if (checklist?.perDay && checklist.contentByDay) {
      const copy = {};
      for (const k of Object.keys(checklist.contentByDay)) {
        copy[k] = checklist.contentByDay[k].map((g) => ({
          ...g,
          items: g.items.map((it) => ({ ...it })),
        }));
      }
      return copy;
    }
    return {};
  });
  const [editingDay, setEditingDay] = useState(days[0] ?? 0);

  const toggleDay = (idx) => {
    setDays((prev) => {
      const next = prev.includes(idx)
        ? prev.filter((d) => d !== idx)
        : [...prev, idx].sort();
      if (perDay && !prev.includes(idx) && editingDay === undefined) {
        setEditingDay(idx);
      }
      return next;
    });
  };

  const getDayGroups = (dayIdx) => contentByDay[dayIdx] || [emptyGroup(1)];

  const setDayGroups = (dayIdx, groups) => {
    setContentByDay((prev) => ({ ...prev, [dayIdx]: groups }));
  };

  const activeGroups = perDay ? getDayGroups(editingDay) : sharedGroups;
  const setActiveGroups = perDay
    ? (groups) => setDayGroups(editingDay, groups)
    : setSharedGroups;

  const addGroup = () => {
    setActiveGroups([...activeGroups, emptyGroup(activeGroups.length + 1)]);
  };

  const updateGroup = (groupId, patch) => {
    setActiveGroups(activeGroups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)));
  };

  const removeGroup = (groupId) => {
    if (activeGroups.length <= 1) return;
    setActiveGroups(activeGroups.filter((g) => g.id !== groupId));
  };

  const addItem = (groupId) => {
    setActiveGroups(
      activeGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: [
                ...g.items,
                { id: makeId("it"), text: "", timerMinutes: null, timerSeconds: 0, done: false },
              ],
            }
          : g
      )
    );
  };
    const updateItem = (groupId, itemId, patch) => {
    setActiveGroups(
      activeGroups.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : g
      )
    );
  };

  const removeItem = (groupId, itemId) => {
    setActiveGroups(
      activeGroups.map((g) => {
        if (g.id !== groupId) return g;
        if (g.items.length <= 1) return g;
        return { ...g, items: g.items.filter((it) => it.id !== itemId) };
      })
    );
  };

  const copyDayToOthers = () => {
    const source = getDayGroups(editingDay);
    const cloned = source.map((g) => ({
      ...g,
      id: makeId("grp"),
      items: g.items.map((it) => ({ ...it, id: makeId("it") })),
    }));
    const next = { ...contentByDay };
    for (const d of days) {
      if (d === editingDay) continue;
      next[d] = cloned.map((g) => ({
        ...g,
        id: makeId("grp"),
        items: g.items.map((it) => ({ ...it, id: makeId("it") })),
      }));
    }
    setContentByDay(next);
  };

  const cleanGroupsList = (groups) =>
    groups
      .map((g) => ({
        ...g,
        title: (g.title || "").trim() || "Блок",
        items: g.items
          .map((it) => ({ ...it, text: (it.text || "").trim() }))
          .filter((it) => it.text.length > 0),
      }))
      .filter((g) => g.items.length > 0);

  const handleSave = () => {
    if (!title.trim() || days.length === 0) return;

    if (perDay) {
      const cleanContentByDay = {};
      let hasAny = false;
      for (const d of days) {
        const cleaned = cleanGroupsList(getDayGroups(d));
        cleanContentByDay[d] = cleaned;
        if (cleaned.length > 0) hasAny = true;
      }
      if (!hasAny) return;

      onSave({
        id: checklist?.id || makeId("cl"),
        title: title.trim(),
        type,
        icon,
        days,
        perDay: true,
        groups: [],
        contentByDay: cleanContentByDay,
        progressByDate: checklist?.progressByDate || {},
        createdAt: checklist?.createdAt || Date.now(),
      });
    } else {
      const cleaned = cleanGroupsList(sharedGroups);
      if (cleaned.length === 0) return;

      onSave({
        id: checklist?.id || makeId("cl"),
        title: title.trim(),
        type,
        icon,
        days,
        perDay: false,
        groups: cleaned,
        contentByDay: {},
        progressByDate: checklist?.progressByDate || {},
        createdAt: checklist?.createdAt || Date.now(),
      });
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <div style={s.section}>
        <label style={s.label}>Название чек-листа</label>
        <input
          style={s.input}
          placeholder="Например: Утренняя рутина, Учёба, Работа"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div style={s.section}>
        <label style={s.label}>Иконка</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              flexShrink: 0,
              background: `${t.accent}18`,
              border: `1.5px solid ${t.accent}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {icon || "🔹"}
          </div>
          <input
            style={{ ...s.input, flex: 1 }}
            placeholder="Вставьте свой смайлик, например 🚀"
            value={icon}
            maxLength={8}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 6 }}>
          Скопируйте и вставьте любой эмодзи — он появится в списке чек-листов.
        </div>
      </div>

      <div style={s.section}>
        <label style={s.label}>Тип чек-листа</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              ...s.btn(type === "once" ? "primary" : "secondary"),
              flex: 1,
              justifyContent: "center",
            }}
            onClick={() => setType("once")}
          >
            Разовый список
          </button>
          <button
            style={{
              ...s.btn(type === "habit" ? "primary" : "secondary"),
              flex: 1,
              justifyContent: "center",
            }}
            onClick={() => setType("habit")}
          >
            Привычка / расписание
          </button>
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 6 }}>
          {type === "once"
            ? "Выполнил всё — список закрыт навсегда."
            : "Отметки сбрасываются каждый день, прогресс хранится по датам и неделям."}
        </div>
      </div>

      {type === "habit" && (
        <div style={s.section}>
          <label style={s.label}>Дни недели, когда действует чек-лист</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {WEEKDAY_LABELS.map((label, idx) => {
              const active = days.includes(idx);
              return (
                <button
                  key={label}
                  onClick={() => toggleDay(idx)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    background: active ? t.accent : t.card,
                    color: active ? "#fff" : t.textMuted,
                    border: active ? "none" : `1px solid ${t.border}`,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {type === "habit" && (
        <div style={s.section}>
          <label style={s.label}>Задачи по дням</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              style={{
                ...s.btn(!perDay ? "primary" : "secondary"),
                flex: 1,
                justifyContent: "center",
                fontSize: 13,
              }}
              onClick={() => setPerDay(false)}
            >
              Одинаково на все дни
            </button>
            <button
              style={{
                ...s.btn(perDay ? "primary" : "secondary"),
                flex: 1,
                justifyContent: "center",
                fontSize: 13,
              }}
              onClick={() => setPerDay(true)}
            >
              Разные задачи по дням
            </button>
          </div>
          <div style={{ fontSize: 12, color: t.textMuted }}>
            {perDay
              ? "У каждого дня свой независимый набор блоков и подзадач — ничего не дублируется автоматически."
              : "Один и тот же набор блоков и подзадач будет показан в любой из выбранных дней."}
          </div>
        </div>
      )}

      {type === "habit" && perDay && (
        <div style={s.section}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {days.map((dayIdx) => {
              const has = (contentByDay[dayIdx] || []).some((g) =>
                g.items.some((it) => (it.text || "").trim())
              );
              return (
                <button
                  key={dayIdx}
                  onClick={() => setEditingDay(dayIdx)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: editingDay === dayIdx ? t.accent : t.card,
                    color: editingDay === dayIdx ? "#fff" : t.textMuted,
                    border:
                      editingDay === dayIdx ? "none" : `1px solid ${t.border}`,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {WEEKDAY_LABELS[dayIdx]}
                  {has && editingDay !== dayIdx && (
                    <span
                      style={{
                        position: "absolute",
                        top: -3,
                        right: -3,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: t.success,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
              Задачи на {WEEKDAY_LABELS[editingDay]}
            </div>
            <button
              style={{ ...s.btn("ghost"), fontSize: 12, padding: "6px 10px" }}
              onClick={copyDayToOthers}
              title="Скопировать задачи этого дня на остальные выбранные дни"
            >
              Скопировать на все дни
            </button>
          </div>
        </div>
      )}

      <div style={s.section}>
        {type === "once" || !perDay ? (
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 12 }}>
            Например: блок «Разогрев» со своими подзадачами, блок «Питание» со своими —
            сколько угодно блоков, у каждого свой набор пунктов.
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {activeGroups.map((group) => (
            <div
              key={group.id}
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <input
                  value={group.icon}
                  maxLength={8}
                  placeholder="🔹"
                  onChange={(e) => updateGroup(group.id, { icon: e.target.value })}
                  title="Свой смайлик для блока"
                  style={{
                    ...s.input,
                    width: 56,
                    padding: "8px 4px",
                    textAlign: "center",
                    fontSize: 18,
                  }}
                />

                <input
                  style={{ ...s.input, flex: 1 }}
                  placeholder="Название блока — например «Разогрев» или «Обед»"
                  value={group.title}
                  onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                />

                <button
                  style={s.btn("danger")}
                  onClick={() => removeGroup(group.id)}
                  title="Удалить блок"
                  disabled={activeGroups.length <= 1}
                >
                  <Icon d={icons.trash} size={14} color={t.danger} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8 }}>
                {group.items.map((it) => (
                  <div
                    key={it.id}
                    style={{
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        style={{ ...s.input, flex: 1 }}
                        placeholder="Подзадача — например «20 приседаний» или «Куриная грудка + рис»"
                        value={it.text}
                        onChange={(e) => updateItem(group.id, it.id, { text: e.target.value })}
                      />
                      <button
                        style={s.btn("danger")}
                        onClick={() => removeItem(group.id, it.id)}
                        title="Удалить подзадачу"
                      >
                        <Icon d={icons.trash} size={13} color={t.danger} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: t.textMuted,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={it.timerMinutes != null}
                          onChange={(e) =>
                            updateItem(group.id, it.id, {
                              timerMinutes: e.target.checked ? 5 : null,
                              timerSeconds: e.target.checked ? (it.timerSeconds || 0) : 0,
                            })
                          }
                        />
                        Таймер
                      </label>

                      {it.timerMinutes != null && (
                        <>
                          <input
                            type="number"
                            min={0}
                            max={180}
                            style={{ ...s.input, width: 56, padding: "6px 8px" }}
                            value={it.timerMinutes}
                            onChange={(e) =>
                              updateItem(group.id, it.id, {
                                timerMinutes: Math.max(0, parseInt(e.target.value, 10) || 0),
                              })
                            }
                          />
                          <span style={{ fontSize: 12, color: t.textMuted }}>мин</span>

                          <input
                            type="number"
                            min={0}
                            max={59}
                            style={{ ...s.input, width: 56, padding: "6px 8px" }}
                            value={it.timerSeconds || 0}
                            onChange={(e) =>
                              updateItem(group.id, it.id, {
                                timerSeconds: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                              })
                            }
                          />
                          <span style={{ fontSize: 12, color: t.textMuted }}>сек</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  style={{ ...s.btn("ghost"), justifyContent: "flex-start", padding: "6px 8px" }}
                  onClick={() => addItem(group.id)}
                >
                  <Icon d={icons.plus} size={13} color={t.textMuted} /> Добавить подзадачу
                </button>
              </div>
            </div>
          ))}
        </div>

        <button style={{ ...s.btn("secondary"), marginTop: 12 }} onClick={addGroup}>
          <Icon d={icons.plus} size={14} color={t.text} /> Добавить блок
        </button>
      </div>

      <div style={{ ...s.row, justifyContent: "flex-end", gap: 8 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>
          Отмена
        </button>
        <button style={s.btn("primary")} onClick={handleSave}>
          <Icon d={icons.plus} size={16} color="#fff" /> Сохранить
        </button>
      </div>
    </div>
  );
      }
        /* -----------------------
   Checklist item timer
   ----------------------- */

function ChecklistItemTimer({ totalSeconds, accent, t }) {
  const initial = Math.max(0, totalSeconds || 0);
  const [remaining, setRemaining] = useState(initial);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => (r <= 1 ? (clearInterval(intervalRef.current), 0) : r - 1));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontVariantNumeric: "tabular-nums",
          color: t.textMuted,
          minWidth: 36,
        }}
      >
        {mins}:{String(secs).padStart(2, "0")}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setRunning((r) => !r);
        }}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: "none",
          background: accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
        title={running ? "Пауза" : "Старт"}
      >
        {running ? "⏸" : "▶"}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setRunning(false);
          setRemaining(initial);
        }}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `1px solid ${accent}55`,
          background: "transparent",
          color: accent,
          fontSize: 11,
          cursor: "pointer",
          flexShrink: 0,
        }}
        title="Сбросить"
      >
        ↺
      </button>
    </div>
  );
}

/* -----------------------
   Checklist Detail
   ----------------------- */

function ChecklistDetail({ checklist, onToggleItem, onEdit, onDelete, theme: t, s }) {
  const isHabit = checklist.type === "habit";
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(todayWeekday());
  const [expandedGroup, setExpandedGroup] = useState(null);

  const selectedDate = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + selectedDay);
    return d;
  }, [weekStart, selectedDay]);

  const dateKey = dateKeyFor(selectedDate);
  const isViewingToday = dateKey === todayKey();

  const groups = isHabit
    ? checklist.perDay
      ? checklist.contentByDay?.[selectedDay] || []
      : checklist.groups || []
    : checklist.groups || [];

  useEffect(() => {
    setExpandedGroup(groups[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, weekStart, checklist.id]);

  const dayProgress = isHabit ? checklist.progressByDate?.[dateKey] || {} : null;
  const isDone = (item) => (isHabit ? !!dayProgress[item.id] : !!item.done);

  const allItems = groups.flatMap((g) => g.items);
  const completedCount = allItems.filter(isDone).length;
  const total = allItems.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const dayIsScheduled = checklist.days.includes(selectedDay);

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goToday = () => {
    setWeekStart(getMonday(new Date()));
    setSelectedDay(todayWeekday());
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 28 }}>{checklist.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>
              {checklist.title}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>
              {isHabit
                ? checklist.perDay
                  ? "Привычка · свои задачи на каждый день"
                  : "Привычка · одинаковые задачи"
                : "Разовый список"}
            </div>
          </div>
        </div>

        <div style={s.row}>
          <button style={s.btn("ghost")} onClick={onEdit}>
            <Icon d={icons.edit} size={16} color={t.text} />
          </button>
          <button style={s.btn("danger")} onClick={onDelete}>
            <Icon d={icons.trash} size={16} color={t.danger} />
          </button>
        </div>
      </div>

      {isHabit && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <button
              style={{ ...s.btn("ghost"), padding: "6px 8px" }}
              onClick={goPrevWeek}
              title="Предыдущая неделя"
            >
              <Icon d="M15 18l-6-6 6-6" size={16} color={t.text} />
            </button>

            <button
              onClick={goToday}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: t.textMuted,
              }}
              title="Перейти к сегодня"
            >
              {weekLabel(weekStart)}
            </button>

            <button
              style={{ ...s.btn("ghost"), padding: "6px 8px" }}
              onClick={goNextWeek}
              title="Следующая неделя"
            >
              <Icon d="M9 18l6-6-6-6" size={16} color={t.text} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {WEEKDAY_LABELS.map((label, idx) => {
              const scheduled = checklist.days.includes(idx);
              const d = new Date(weekStart);
              d.setDate(d.getDate() + idx);
              const dKey = dateKeyFor(d);
              const isTodayCell = dKey === todayKey();
              const isSelected = idx === selectedDay;

              const dp = checklist.progressByDate?.[dKey] || {};
              const dayGroups = checklist.perDay
                ? checklist.contentByDay?.[idx] || []
                : checklist.groups || [];
              const dayItems = dayGroups.flatMap((g) => g.items);
              const dayDone =
                dayItems.length > 0 && dayItems.every((it) => !!dp[it.id]);

              return (
                <button
                  key={label}
                  onClick={() => setSelectedDay(idx)}
                  style={{
                    flex: "1 1 12%",
                    minWidth: 36,
                    height: 44,
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    gap: 2,
                    cursor: "pointer",
                    background: isSelected
                      ? t.accent
                      : scheduled
                      ? `${t.accent}14`
                      : "transparent",
                    color: isSelected ? "#fff" : scheduled ? t.text : t.textMuted,
                    border: isTodayCell
                      ? `2px solid ${t.accent}`
                      : `1px solid ${t.border}`,
                    opacity: scheduled ? 1 : 0.5,
                  }}
                >
                  <span>{label}</span>
                  {dayDone && (
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: isSelected ? "#fff" : t.success,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {isHabit && !dayIsScheduled && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: `${t.warning}18`,
            border: `1px solid ${t.warning}55`,
            fontSize: 13,
            color: t.warning,
          }}
        >
          {WEEKDAY_LABELS[selectedDay]} не входит в расписание этого чек-листа — но пункты
          всё равно можно отмечать.
        </div>
      )}

      {isHabit && dayIsScheduled && groups.length === 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: t.card,
            border: `1px solid ${t.border}`,
            fontSize: 13,
            color: t.textMuted,
            textAlign: "center",
          }}
        >
          На {WEEKDAY_LABELS[selectedDay]} задачи ещё не добавлены. Откройте редактирование,
          чтобы заполнить этот день.
        </div>
      )}

      {total > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: t.textMuted,
              marginBottom: 6,
            }}
          >
            <span>
              Прогресс{isHabit ? (isViewingToday ? " · сегодня" : ` · ${WEEKDAY_LABELS[selectedDay]}`) : ""}
            </span>
            <span style={{ fontWeight: 600, color: t.text }}>
              {completedCount}/{total}
            </span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: t.border,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: t.accent,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map((group) => {
          const groupDone = group.items.filter(isDone).length;
          const groupTotal = group.items.length;
          const groupComplete = groupTotal > 0 && groupDone === groupTotal;
          const isExpanded = expandedGroup === group.id;

          return (
            <div
              key={group.id}
              style={{
                background: t.card,
                border: `1px solid ${groupComplete ? t.success + "55" : t.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 18 }}>{group.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>
                    {group.title}
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>
                    {groupDone}/{groupTotal} выполнено
                  </div>
                </div>
                {groupComplete && <Icon d="M20 6L9 17l-5-5" size={16} color={t.success} />}
                <Icon
                  d="M9 18l6-6-6-6"
                  size={14}
                  color={t.textMuted}
                  style={{
                    transform: isExpanded ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>

              {isExpanded && (
                <div
                  style={{
                    padding: "0 12px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {group.items.map((item) => {
                    const done = isDone(item);
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: done ? `${t.accent}11` : t.surface,
                          border: `1px solid ${done ? t.accent + "55" : t.border}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <button
                          onClick={() => onToggleItem(checklist.id, item.id, dateKey)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: done ? "none" : `1.5px solid ${t.border}`,
                            background: done ? t.accent : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {done && <Icon d="M20 6L9 17l-5-5" size={13} color="#fff" />}
                        </button>

                        <span
                          style={{
                            flex: 1,
                            fontSize: 14,
                            color: done ? t.textMuted : t.text,
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {item.text}
                        </span>

                        {item.timerMinutes != null && (
                          <ChecklistItemTimer
                            totalSeconds={item.timerMinutes * 60 + (item.timerSeconds || 0)}
                            accent={t.accent}
                            t={t}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {total > 0 && pct === 100 && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 10,
            background: `${t.success}18`,
            border: `1px solid ${t.success}55`,
            textAlign: "center",
            fontSize: 13,
            color: t.success,
            fontWeight: 600,
          }}
        >
          {isHabit ? "Всё выполнено 🎉" : "Список выполнен полностью 🎉"}
        </div>
      )}
    </div>
  );
            }
        /* -----------------------
   Quiz (Tests) module: import, editor, detail, player, results
   ----------------------- */

function emptyQuizOption() {
  return { id: makeId("opt"), text: "" };
}

function emptyQuizQuestion() {
  const optA = emptyQuizOption();
  return {
    id: makeId("q"),
    text: "",
    options: [optA, emptyQuizOption()],
    correctOptionIds: [],
    multiple: false,
  };
}

function QuizImport({ onImported, onCancel, theme: t, s }) {
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileWarning, setFileWarning] = useState("");
  const [parsed, setParsed] = useState(null);
  const [splitMode, setSplitMode] = useState("single");
  const [busy, setBusy] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setFileWarning("");
    setFileName(file.name);
    const lower = file.name.toLowerCase();

    if (lower.endsWith(".txt")) {
      const text = await file.text();
      setRawText(text);
    } else if (lower.endsWith(".docx")) {
      setBusy(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setRawText(result.value || "");
      } catch (e) {
        setFileWarning("Не удалось прочитать .docx файл. Попробуйте вставить текст вручную.");
      } finally {
        setBusy(false);
      }
    } else if (lower.endsWith(".pdf")) {
      setFileWarning("PDF пока не поддерживается. Вставьте текст вопросов вручную в поле ниже.");
    } else {
      setFileWarning("Формат файла не поддерживается. Используйте .txt или .docx.");
    }
  };

  const runParse = () => {
    if (!rawText.trim()) return;
    const result = smartParseQuiz(rawText);
    setParsed(result);
    if (result.hasSections) setSplitMode("single");
  };

  const confirmImport = () => {
    if (!parsed || parsed.questions.length === 0) return;

    const baseTitle = fileName ? fileName.replace(/\.(txt|docx|pdf)$/i, "") : "Импортированный тест";

    if (!parsed.hasSections || splitMode === "flat") {
      onImported([
        {
          id: makeId("quiz"),
          title: baseTitle,
          description: "",
          questions: parsed.questions,
          sections: [],
          history: [],
        },
      ]);
      return;
    }

    if (splitMode === "single") {
      onImported([
        {
          id: makeId("quiz"),
          title: baseTitle,
          description: "",
          questions: parsed.questions,
          sections: parsed.sections,
          history: [],
        },
      ]);
      return;
    }

    const quizzes = parsed.sections.map((sec) => ({
      id: makeId("quiz"),
      title: `${baseTitle} — ${sec.name}`,
      description: "",
      questions: parsed.questions.filter((q) => sec.questionIds.includes(q.id)),
      sections: [],
      history: [],
    }));

    onImported(quizzes);
  };

  return (
    <div>
      <div style={{ ...s.row, marginBottom: 16 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>
          <Icon d={icons.back} size={16} color={t.text} /> Назад
        </button>
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>
        Импортировать тест
      </div>
      <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>
        Загрузите файл .txt или .docx, либо вставьте текст вопросов вручную.
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            ...s.btn("secondary"),
            width: "100%",
            justifyContent: "center",
            opacity: busy ? 0.6 : 1,
            pointerEvents: "none",
          }}
        >
          <Icon d={icons.upload} size={16} color={t.text} />
          {busy ? "Читаем файл..." : fileName ? `Файл: ${fileName}` : "Выбрать файл (.txt, .docx)"}
        </div>
        <input
          type="file"
          accept=".txt,.docx,.pdf"
          disabled={busy}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: busy ? "default" : "pointer",
          }}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {fileWarning && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            background: `${t.warning}18`,
            border: `1.5px solid ${t.warning}55`,
            color: t.warning,
            fontSize: 12.5,
            marginBottom: 12,
          }}
        >
          {fileWarning}
        </div>
      )}

      <div style={s.section}>
        <label style={s.label}>Текст вопросов</label>
        <textarea
          style={s.textarea}
          placeholder={`1. Текст вопроса\nа) вариант 1\nб) вариант 2*\nв) вариант 3\n\n2. Следующий вопрос...`}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setParsed(null);
          }}
        />
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 6, lineHeight: 1.5 }}>
          Правильный ответ отмечайте звёздочкой (*), галочкой (✓) или добавьте блок «Ответы:» в конце файла.
        </div>
      </div>

      {!parsed && (
        <button
          style={{ ...s.btn("primary"), width: "100%", justifyContent: "center" }}
          onClick={runParse}
          disabled={!rawText.trim()}
        >
          Распознать вопросы
        </button>
      )}

      {parsed && (
        <div>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: parsed.questions.length ? `${t.success}14` : `${t.danger}14`,
              border: `1.5px solid ${parsed.questions.length ? t.success + "55" : t.danger + "55"}`,
              marginBottom: 14,
              fontSize: 13.5,
              color: parsed.questions.length ? t.success : t.danger,
            }}
          >
            {parsed.questions.length
              ? `Распознано вопросов: ${parsed.questions.length}${parsed.hasSections ? `, разделов: ${parsed.sections.length}` : ""}`
              : "Не удалось распознать вопросы. Проверьте формат текста."}
          </div>

          {parsed.questions.length > 0 && (
            <div
              style={{
                maxHeight: 220,
                overflowY: "auto",
                marginBottom: 16,
                border: `1.5px solid ${t.border}`,
                borderRadius: 12,
                padding: 10,
              }}
            >
              {parsed.questions.slice(0, 8).map((q) => (
                <div key={q.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>
                    {q.num}. {q.text}
                  </div>
                  {q.options.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        fontSize: 12.5,
                        color: q.correctOptionIds.includes(o.id) ? t.success : t.textMuted,
                        fontWeight: q.correctOptionIds.includes(o.id) ? 700 : 400,
                      }}
                    >
                      {q.correctOptionIds.includes(o.id) ? "✓ " : "· "}
                      {o.text}
                    </div>
                  ))}
                </div>
              ))}
              {parsed.questions.length > 8 && (
                <div style={{ fontSize: 12, color: t.textMuted, textAlign: "center" }}>
                  ... и ещё {parsed.questions.length - 8}
                </div>
              )}
            </div>
          )}

          {parsed.hasSections && (
            <div style={s.section}>
              <label style={s.label}>Обнаружены разделы по темам</label>
              {[
                { id: "single", label: "Один тест с разделами (переключение внутри теста)" },
                { id: "flat", label: "Сплошной тест (все вопросы вместе)" },
                { id: "separate", label: "Отдельный тест для каждой темы" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSplitMode(opt.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px",
                    borderRadius: 12,
                    background: splitMode === opt.id ? `${t.accent}14` : t.card,
                    border: splitMode === opt.id ? `2px solid ${t.accent}` : `1.5px solid ${t.border}`,
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: `2px solid ${splitMode === opt.id ? t.accent : t.border}`,
                      background: splitMode === opt.id ? t.accent : "transparent",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: 13, color: t.text }}>{opt.label}</div>
                </button>
              ))}
            </div>
          )}

          {parsed.questions.length > 0 && (
            <button
              style={{ ...s.btn("primary"), width: "100%", justifyContent: "center" }}
              onClick={confirmImport}
            >
              <Icon d="M20 6L9 17l-5-5" size={16} color="#FAF7F2" /> Импортировать
            </button>
          )}
        </div>
      )}
    </div>
  );
                     }
function QuizEditor({ quiz, onSave, onCancel, theme: t, s }) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [questions, setQuestions] = useState(
    quiz?.questions?.length ? quiz.questions.map((q) => ({ ...q })) : [emptyQuizQuestion()]
  );
  const [expandedId, setExpandedId] = useState(questions[0]?.id || null);

  useEffect(() => {
    saveQuizDraft({ id: quiz?.id || null, title, description, questions });
  }, [title, description, questions, quiz]);

  const updateQuestion = (id, patch) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const updateOption = (qId, optId, text) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) }
          : q
      )
    );
  };

  const toggleCorrect = (qId, optId) => {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qId) return q;
        const has = q.correctOptionIds.includes(optId);
        const next = q.multiple
          ? has
            ? q.correctOptionIds.filter((id) => id !== optId)
            : [...q.correctOptionIds, optId]
          : [optId];
        return { ...q, correctOptionIds: next };
      })
    );
  };

  const addOption = (qId) => {
    setQuestions((qs) =>
      qs.map((q) => (q.id === qId ? { ...q, options: [...q.options, emptyQuizOption()] } : q))
    );
  };

  const removeOption = (qId, optId) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.filter((o) => o.id !== optId),
              correctOptionIds: q.correctOptionIds.filter((id) => id !== optId),
            }
          : q
      )
    );
  };

  const addQuestion = () => {
    const nq = emptyQuizQuestion();
    setQuestions((qs) => [...qs, nq]);
    setExpandedId(nq.id);
  };

  const removeQuestion = (id) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    clearQuizDraft();
    onSave({
      id: quiz?.id || makeId("quiz"),
      title: title.trim(),
      description: description.trim(),
      questions: questions.filter((q) => q.text.trim() && q.options.filter((o) => o.text.trim()).length >= 2),
      sections: quiz?.sections || [],
      history: quiz?.history || [],
    });
  };

  return (
    <div>
      <div style={{ ...s.row, marginBottom: 16 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>
          <Icon d={icons.back} size={16} color={t.text} /> Назад
        </button>
      </div>

      <div style={s.section}>
        <label style={s.label}>Название теста</label>
        <input style={s.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" />
      </div>

      <div style={s.section}>
        <label style={s.label}>Описание</label>
        <input
          style={s.input}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Необязательно"
        />
      </div>

      <div style={{ ...s.label, marginBottom: 10 }}>ВОПРОСЫ ({questions.length})</div>

      {questions.map((q, qi) => {
        const isExpanded = expandedId === q.id;
        return (
          <div
            key={q.id}
            style={{
              border: `1.5px solid ${t.border}`,
              borderRadius: 14,
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : q.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                background: t.card,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, flex: 1 }}>
                {qi + 1}. {q.text || "Новый вопрос"}
              </div>
              <Icon
                d={icons.chevronRight}
                size={16}
                color={t.textMuted}
                style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}
              />
            </button>

            {isExpanded && (
              <div style={{ padding: 14, background: t.surface }}>
                <textarea
                  style={{ ...s.textarea, minHeight: 60, marginBottom: 12 }}
                  placeholder="Текст вопроса"
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                />

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12.5,
                    color: t.textMuted,
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={q.multiple}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        multiple: e.target.checked,
                        correctOptionIds: e.target.checked ? q.correctOptionIds : q.correctOptionIds.slice(0, 1),
                      })
                    }
                  />
                  Несколько правильных ответов
                </label>

                {q.options.map((o) => (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <button
                      onClick={() => toggleCorrect(q.id, o.id)}
                      title="Отметить как правильный"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: q.multiple ? 6 : "50%",
                        border: `2px solid ${q.correctOptionIds.includes(o.id) ? t.success : t.border}`,
                        background: q.correctOptionIds.includes(o.id) ? t.success : "transparent",
                        flexShrink: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {q.correctOptionIds.includes(o.id) && (
                        <Icon d="M20 6L9 17l-5-5" size={13} color="#FAF7F2" />
                      )}
                    </button>
                    <input
                      style={{ ...s.input, flex: 1 }}
                      value={o.text}
                      onChange={(e) => updateOption(q.id, o.id, e.target.value)}
                      placeholder="Вариант ответа"
                    />
                    {q.options.length > 2 && (
                      <button style={s.btn("ghost")} onClick={() => removeOption(q.id, o.id)}>
                        <Icon d={icons.trash} size={14} color={t.danger} />
                      </button>
                    )}
                  </div>
                ))}

                <button style={{ ...s.btn("secondary"), marginBottom: 10 }} onClick={() => addOption(q.id)}>
                  <Icon d={icons.plus} size={14} color={t.text} /> Вариант
                </button>

                <button
                  style={{ ...s.btn("danger"), width: "100%", justifyContent: "center" }}
                  onClick={() => removeQuestion(q.id)}
                >
                  <Icon d={icons.trash} size={14} color={t.danger} /> Удалить вопрос
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button style={{ ...s.btn("secondary"), width: "100%", justifyContent: "center", marginBottom: 16 }} onClick={addQuestion}>
        <Icon d={icons.plus} size={16} color={t.text} /> Добавить вопрос
      </button>

      <button
        style={{ ...s.btn("primary"), width: "100%", justifyContent: "center" }}
        onClick={handleSave}
        disabled={!title.trim()}
      >
        Сохранить тест
      </button>
    </div>
  );
      }
        function QuizDetail({ quiz, onEdit, onDelete, onStart, onResetHistory, theme: t, s }) {
  const total = quiz.questions.length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: t.text, marginBottom: 4 }}>
          {quiz.title}
        </div>
        {quiz.description && (
          <div style={{ fontSize: 13.5, color: t.textMuted, marginBottom: 8 }}>
            {quiz.description}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: t.textMuted }}>
          {total} {total === 1 ? "вопрос" : total < 5 ? "вопроса" : "вопросов"}
          {quiz.sections?.length > 0 ? ` · ${quiz.sections.length} раздела` : ""}
        </div>
      </div>

      <button
        style={{ ...s.btn("primary"), width: "100%", justifyContent: "center", marginBottom: 12 }}
        onClick={onStart}
        disabled={total === 0}
      >
        <Icon d="M8 5v14l11-7z" size={16} color="#FAF7F2" /> Начать прохождение
      </button>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={{ ...s.btn("secondary"), flex: 1, justifyContent: "center" }} onClick={onEdit}>
          <Icon d={icons.edit} size={14} color={t.text} /> Редактировать
        </button>
        <button style={{ ...s.btn("danger"), flex: 1, justifyContent: "center" }} onClick={onDelete}>
          <Icon d={icons.trash} size={14} color={t.danger} /> Удалить
        </button>
      </div>

      <div style={{ ...s.label, marginBottom: 10 }}>ИСТОРИЯ ПОПЫТОК</div>

      {(!quiz.history || quiz.history.length === 0) ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: t.textMuted, fontSize: 13 }}>
          Пока нет попыток прохождения
        </div>
      ) : (
        <div>
          {quiz.history.map((h, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 10,
                background: t.card,
                border: `1.5px solid ${t.border}`,
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 13, color: t.text }}>
                {new Date(h.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                {" "}
                <span style={{ color: t.textMuted, fontSize: 12 }}>
                  {new Date(h.date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  {h.correct}/{h.total}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: h.scorePercent >= 70 ? t.success : h.scorePercent >= 40 ? t.warning : t.danger,
                  }}
                >
                  {h.scorePercent}%
                </div>
              </div>
            </div>
          ))}
          <button style={{ ...s.btn("ghost"), fontSize: 12.5 }} onClick={onResetHistory}>
            Сбросить статистику
          </button>
        </div>
      )}
    </div>
  );
}

function QuizPlayer({ quiz, onFinish, onCancel, theme: t, s }) {
  const [order] = useState(() => quiz.questions.map((q) => q.id));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startedAt] = useState(() => Date.now());

  const currentQ = quiz.questions.find((q) => q.id === order[currentIdx]);
  const isLast = currentIdx === order.length - 1;
  const selected = answers[currentQ.id] || [];
  const hasAnswer = selected.length > 0;

  const selectOption = (optId) => {
    setAnswers((a) => {
      const current = a[currentQ.id] || [];
      if (currentQ.multiple) {
        const has = current.includes(optId);
        return { ...a, [currentQ.id]: has ? current.filter((id) => id !== optId) : [...current, optId] };
      }
      return { ...a, [currentQ.id]: [optId] };
    });
  };

  const finish = () => {
    const durationSec = Math.round((Date.now() - startedAt) / 1000);
    let correctCount = 0;

    const details = order.map((qId) => {
      const q = quiz.questions.find((x) => x.id === qId);
      const given = (answers[qId] || []).slice().sort();
      const correct = q.correctOptionIds.slice().sort();
      const isCorrect = given.length === correct.length && given.every((id, i) => id === correct[i]);
      if (isCorrect) correctCount++;
      return { questionId: qId, given, correct, isCorrect };
    });

    const scorePercent = Math.round((correctCount / order.length) * 100);

    onFinish({
      date: new Date().toISOString(),
      correct: correctCount,
      total: order.length,
      scorePercent,
      durationSec,
      details,
    });
  };

  return (
    <div>
      <div style={{ ...s.row, marginBottom: 16, justifyContent: "space-between" }}>
        <button style={s.btn("ghost")} onClick={onCancel}>
          <Icon d={icons.back} size={16} color={t.text} /> Прервать
        </button>
        <div style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>
          Вопрос {currentIdx + 1} из {order.length}
        </div>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 4,
          background: t.border,
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((currentIdx + 1) / order.length) * 100}%`,
            background: t.accent,
            transition: "width 0.3s",
          }}
        />
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 18, lineHeight: 1.4 }}>
        {currentQ.text}
      </div>

      {currentQ.multiple && (
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 10 }}>
          Можно выбрать несколько вариантов
        </div>
      )}

      {currentQ.options.map((o) => {
        const isSelected = selected.includes(o.id);
        return (
          <button
            key={o.id}
            onClick={() => selectOption(o.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "13px 14px",
              borderRadius: 12,
              background: isSelected ? `${t.accent}14` : t.card,
              border: isSelected ? `2px solid ${t.accent}` : `1.5px solid ${t.border}`,
              cursor: "pointer",
              textAlign: "left",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: currentQ.multiple ? 6 : "50%",
                border: `2px solid ${isSelected ? t.accent : t.border}`,
                background: isSelected ? t.accent : "transparent",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelected && <Icon d="M20 6L9 17l-5-5" size={13} color="#FAF7F2" />}
            </div>
            <div style={{ fontSize: 14, color: t.text }}>{o.text}</div>
          </button>
        );
      })}

      <button
        style={{ ...s.btn("primary"), width: "100%", justifyContent: "center", marginTop: 10 }}
        disabled={!hasAnswer}
        onClick={() => {
          if (isLast) {
            finish();
          } else {
            setCurrentIdx((i) => i + 1);
          }
        }}
      >
        {isLast ? "Ответить" : "Далее"}
      </button>
    </div>
  );
}

function QuizResults({ quiz, result, onClose, onShare, theme: t, s }) {
  const wrongDetails = result.details.filter((d) => !d.isCorrect);

  const minutes = Math.floor(result.durationSec / 60);
  const seconds = result.durationSec % 60;
  const timeLabel = minutes > 0 ? `${minutes} мин ${seconds} сек` : `${seconds} сек`;

  return (
    <div>
      <div
        style={{
          textAlign: "center",
          padding: "28px 16px",
          borderRadius: 18,
          background: t.card,
          border: `1.5px solid ${t.border}`,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: result.scorePercent >= 70 ? t.success : result.scorePercent >= 40 ? t.warning : t.danger,
            marginBottom: 6,
          }}
        >
          {result.scorePercent}%
        </div>
        <div style={{ fontSize: 14, color: t.text, marginBottom: 4 }}>
          Правильно: {result.correct} из {result.total}
        </div>
        <div style={{ fontSize: 12.5, color: t.textMuted }}>Время: {timeLabel}</div>
      </div>

      {wrongDetails.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...s.label, marginBottom: 10 }}>РАЗБОР ОШИБОК</div>
          {wrongDetails.map((d) => {
            const q = quiz.questions.find((x) => x.id === d.questionId);
            const correctOptions = q.options.filter((o) => q.correctOptionIds.includes(o.id));
            return (
              <div
                key={d.questionId}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: `${t.danger}0D`,
                  border: `1.5px solid ${t.danger}33`,
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>
                  {q.text}
                </div>
                <div style={{ fontSize: 12.5, color: t.success }}>
                  Правильно: {correctOptions.map((o) => o.text).join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button style={{ ...s.btn("secondary"), width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={onShare}>
        <Icon d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" size={16} color={t.text} />
        Поделиться результатом
      </button>

      <button style={{ ...s.btn("primary"), width: "100%", justifyContent: "center" }} onClick={onClose}>
        Готово
      </button>
    </div>
  );
        }

      /* -----------------------
   Main App
   ----------------------- */

export default function SmartNotesApp() {
  const [data, setData] = useState(() => loadData());
  const [theme, setTheme] = useState(data.theme || "light");
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
  const [newCategoryColor, setNewCategoryColor] = useState("#C4622D");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [selectionMode, setSelectionMode] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);

  const [undoAction, setUndoAction] = useState(null);
  const undoTimerRef = useRef(null);

  const [quizDraftExists, setQuizDraftExists] = useState(false);
  const quizSaveTimerRef = useRef(null);

  const [librarySearch, setLibrarySearch] = useState("");
  const [libName, setLibName] = useState("");
  const [libContent, setLibContent] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 768
  );
  const chatRef = useRef(null);

  const prevHeightRef = useRef(0);
  const isUserAtBottomRef = useRef(true);

  const [saveStatus, setSaveStatus] = useState("idle");
  const [draftExists, setDraftExists] = useState(false);
  const saveTimerRef = useRef(null);

  const [subnoteOpenId, setSubnoteOpenId] = useState(null);

  const [checklistView, setChecklistView] = useState("list");
  const [activeChecklistId, setActiveChecklistId] = useState(null);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [showChecklistDeleteConfirm, setShowChecklistDeleteConfirm] = useState(null);

  const [quizView, setQuizView] = useState("list");
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showQuizDeleteConfirm, setShowQuizDeleteConfirm] = useState(null);
  const [quizSearch, setQuizSearch] = useState("");
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState(null);

  const [sportView, setSportView] = useState("dashboard");
  const [sportFilterType, setSportFilterType] = useState("all");
  const [sportFilterPeriod, setSportFilterPeriod] = useState("all");
  const [sportSearch, setSportSearch] = useState("");
  const [sportViewMode, setSportViewMode] = useState("list");
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showWorkoutDeleteConfirm, setShowWorkoutDeleteConfirm] = useState(null);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(() => todayKey());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventDeleteConfirm, setShowEventDeleteConfirm] = useState(null);
  const [eventDetailId, setEventDetailId] = useState(null);

  const [colorScheme, setColorScheme] = useState(data.colorScheme || "warm");
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sideMenuMode, setSideMenuMode] = useState("folders");
  const [navEditingTabId, setNavEditingTabId] = useState(null);
  const [folderSearch, setFolderSearch] = useState("");

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState(null);
  const [appearanceSubview, setAppearanceSubview] = useState(null);
  const [fontScale, setFontScale] = useState(data.fontScale || 1);
  const [fontFamily, setFontFamily] = useState(data.fontFamily || "system");
  const [agreementTab, setAgreementTab] = useState("terms");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const themes = useMemo(() => buildThemes(colorScheme), [colorScheme]);
  const t = themes[theme];

  const filteredLibrary = useMemo(() => {
    return data.library.filter(
      (item) =>
        item.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
        item.content.toLowerCase().includes(librarySearch.toLowerCase())
    );
  }, [data.library, librarySearch]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isLandscape = windowWidth > windowHeight;

  let maxWidth, contentPadding, headerPadding, cardPadding, bottomNavPadding;

  if (isMobile) {
    maxWidth = isLandscape ? "100%" : "480px";
    contentPadding = "16px";
    headerPadding = "20px 16px 12px";
    cardPadding = "16px";
    bottomNavPadding = "60px";
  } else if (isTablet) {
    maxWidth = "100%";
    contentPadding = isLandscape ? "32px" : "24px";
    headerPadding = isLandscape ? "20px 32px 16px" : "24px 24px 16px";
    cardPadding = isLandscape ? "24px" : "20px";
    bottomNavPadding = "72px";
  } else {
    maxWidth = "100%";
    contentPadding = "40px";
    headerPadding = "24px 40px 16px";
    cardPadding = "24px";
    bottomNavPadding = "80px";
  }

  const gridColumns = isMobile ? 1 : isTablet ? 2 : 3;

  const persist = (next) => {
    setData(next);
    saveData(next);
  };
  const toggleTheme = () => {
  const newTheme = theme === "dark" ? "light" : "dark";
  setTheme(newTheme);
  persist({ ...data, theme: newTheme });
};

const applyColorScheme = (schemeId) => {
  setColorScheme(schemeId);
  persist({ ...data, colorScheme: schemeId });
};

const applyFontScale = (scale) => {
  setFontScale(scale);
  persist({ ...data, fontScale: scale });
};

const applyFontFamily = (family) => {
  setFontFamily(family);
  persist({ ...data, fontFamily: family });
};

const saveChecklist = (checklist) => {
  const exists = data.checklists.some((c) => c.id === checklist.id);
  const nextChecklists = exists
    ? data.checklists.map((c) => (c.id === checklist.id ? checklist : c))
    : [...data.checklists, checklist];

  persist({ ...data, checklists: nextChecklists });
  setActiveChecklistId(checklist.id);
  setEditingChecklist(null);
  setChecklistView("detail");
};

const deleteChecklist = (id) => {
  persist({ ...data, checklists: data.checklists.filter((c) => c.id !== id) });
  setShowChecklistDeleteConfirm(null);
  setActiveChecklistId(null);
  setChecklistView("list");
};

const toggleChecklistItem = (checklistId, itemId, dateKey) => {
  const nextChecklists = data.checklists.map((c) => {
    if (c.id !== checklistId) return c;

    if (c.type === "habit") {
      const dayMap = { ...(c.progressByDate?.[dateKey] || {}) };
      dayMap[itemId] = !dayMap[itemId];

      return {
        ...c,
        progressByDate: { ...c.progressByDate, [dateKey]: dayMap },
      };
    }

    return {
      ...c,
      groups: c.groups.map((g) => ({
        ...g,
        items: g.items.map((it) =>
          it.id === itemId ? { ...it, done: !it.done } : it
        ),
      })),
    };
  });

  persist({ ...data, checklists: nextChecklists });
};

const saveQuiz = (quiz) => {
  const exists = data.quizzes.some((q) => q.id === quiz.id);
  const nextQuizzes = exists
    ? data.quizzes.map((q) => (q.id === quiz.id ? quiz : q))
    : [...data.quizzes, quiz];

  persist({ ...data, quizzes: nextQuizzes });
  setActiveQuizId(quiz.id);
  setEditingQuiz(null);
  setQuizView("detail");
  setQuizDraftExists(false);
};

const deleteQuiz = (id) => {
  const removedQuiz = data.quizzes.find((q) => q.id === id);
  const removedIndex = data.quizzes.findIndex((q) => q.id === id);

  persist({ ...data, quizzes: data.quizzes.filter((q) => q.id !== id) });
  setShowQuizDeleteConfirm(null);
  setActiveQuizId(null);
  setQuizView("list");

  if (removedQuiz) {
    triggerUndo("Элемент удалён", () => {
      setData((cur) => {
        const nextQuizzes = [...cur.quizzes];
        nextQuizzes.splice(Math.min(removedIndex, nextQuizzes.length), 0, removedQuiz);
        const next = { ...cur, quizzes: nextQuizzes };
        saveData(next);
        return next;
      });
    });
  }
};

const duplicateQuiz = (id) => {
  const original = data.quizzes.find((q) => q.id === id);
  if (!original) return;

  const copy = {
    ...original,
    id: makeId("quiz"),
    title: `${original.title} (копия)`,
    history: [],
  };

  persist({ ...data, quizzes: [copy, ...data.quizzes] });
};

const bulkDeleteQuizzes = (ids) => {
  const idSet = new Set(ids);
  const removed = data.quizzes.filter((q) => idSet.has(q.id));
  if (removed.length === 0) return;

  persist({ ...data, quizzes: data.quizzes.filter((q) => !idSet.has(q.id)) });
  exitSelectionMode();

  triggerUndo(
    removed.length > 1 ? `Удалено элементов: ${removed.length}` : "Элемент удалён",
    () => {
      setData((cur) => {
        const next = { ...cur, quizzes: [...removed, ...cur.quizzes] };
        saveData(next);
        return next;
      });
    }
  );
};

const bulkDuplicateQuizzes = (ids) => {
  const idSet = new Set(ids);
  const originals = data.quizzes.filter((q) => idSet.has(q.id));
  const copies = originals.map((q) => ({
    ...q,
    id: makeId("quiz"),
    title: `${q.title} (копия)`,
    history: [],
  }));

  persist({ ...data, quizzes: [...copies, ...data.quizzes] });
  exitSelectionMode();
  showNotification(copies.length > 1 ? `📄 Продублировано: ${copies.length}` : "📄 Копия создана");
};

const bulkSendQuizzesToAI = (ids) => {
  const idSet = new Set(ids);
  const quizzes = data.quizzes.filter((q) => idSet.has(q.id));
  const combined = quizzes
    .map(
      (q) =>
        `Тест: ${q.title}\n` +
        q.questions
          .map((qq, i) => `${i + 1}. ${qq.text}\n${qq.options.map((o) => `- ${o.text}`).join("\n")}`)
          .join("\n\n")
    )
    .join("\n\n---\n\n");

  exitSelectionMode();
  setTab("ai");
  setChatInput((prev) => (prev ? `${prev}\n\n${combined}` : combined));
  showNotification("🤖 Тесты добавлены в поле ввода ИИ");
};

const resetQuizHistory = (id) => {
  persist({
    ...data,
    quizzes: data.quizzes.map((q) =>
      q.id === id ? { ...q, history: [] } : q
    ),
  });
};

const recordQuizAttempt = (id, attempt) => {
  const nextQuizzes = data.quizzes.map((q) => {
    if (q.id !== id) return q;

    const history = [attempt, ...(q.history || [])].slice(0, 5);

    return { ...q, history };
  });

  persist({ ...data, quizzes: nextQuizzes });
};

const saveWorkout = (workout) => {
  const exists = data.workouts.some((w) => w.id === workout.id);
  const nextWorkouts = exists
    ? data.workouts.map((w) => (w.id === workout.id ? workout : w))
    : [...data.workouts, workout];

  persist({ ...data, workouts: nextWorkouts });
  setActiveWorkoutId(workout.id);
  setEditingWorkout(null);
  setSportView("detail");
};

const deleteWorkout = (id) => {
  const removed = data.workouts.find((w) => w.id === id);
  const removedIndex = data.workouts.findIndex((w) => w.id === id);

  persist({ ...data, workouts: data.workouts.filter((w) => w.id !== id) });
  setShowWorkoutDeleteConfirm(null);
  setActiveWorkoutId(null);
  setSportView("journal");

  if (removed) {
    triggerUndo("Тренировка удалена", () => {
      setData((cur) => {
        const nextWorkouts = [...cur.workouts];
        nextWorkouts.splice(Math.min(removedIndex, nextWorkouts.length), 0, removed);
        const next = { ...cur, workouts: nextWorkouts };
        saveData(next);
        return next;
      });
    });
  }
};

const duplicateWorkout = (id) => {
  const original = data.workouts.find((w) => w.id === id);
  if (!original) return;

  const copy = { ...original, id: makeId("wrk") };
  persist({ ...data, workouts: [copy, ...data.workouts] });
  showNotification("📄 Копия тренировки создана");
};

const saveWorkoutTemplate = (template) => {
  const exists = data.workoutTemplates.some((tpl) => tpl.id === template.id);
  const nextTemplates = exists
    ? data.workoutTemplates.map((tpl) => (tpl.id === template.id ? template : tpl))
    : [...data.workoutTemplates, template];

  persist({ ...data, workoutTemplates: nextTemplates });
};

const deleteWorkoutTemplate = (id) => {
  persist({ ...data, workoutTemplates: data.workoutTemplates.filter((tpl) => tpl.id !== id) });
};

const createWorkoutFromTemplate = (template) => {
  setEditingWorkout({
    id: null,
    type: template.type,
    title: template.title,
    startTime: new Date().toISOString(),
    durationMin: template.durationMin || 30,
    distanceKm: null,
    calories: null,
    heartRate: null,
    feeling: 5,
    exercises: template.exercises ? template.exercises.map((ex) => ({ ...ex, id: makeId("ex") })) : [],
    note: "",
    tags: template.tags || [],
  });
  setSportView("editor");
};

const isWidgetActive = (widgetId) => data.activeWidgets.some((w) => w.id === widgetId);

const addWidget = (widgetId) => {
  if (isWidgetActive(widgetId)) return;
  const nextWidget = {
    id: widgetId,
    order: data.activeWidgets.length,
    size: "medium",
    color: t.accent,
  };
  persist({ ...data, activeWidgets: [...data.activeWidgets, nextWidget] });
};

const removeWidget = (widgetId) => {
  persist({
    ...data,
    activeWidgets: data.activeWidgets
      .filter((w) => w.id !== widgetId)
      .map((w, i) => ({ ...w, order: i })),
  });
};

const toggleWidget = (widgetId) => {
  if (isWidgetActive(widgetId)) removeWidget(widgetId);
  else addWidget(widgetId);
};

const reorderWidget = (widgetId, direction) => {
  const sorted = [...data.activeWidgets].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((w) => w.id === widgetId);
  const swapIdx = idx + direction;
  if (idx === -1 || swapIdx < 0 || swapIdx >= sorted.length) return;

  [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
  const reindexed = sorted.map((w, i) => ({ ...w, order: i }));
  persist({ ...data, activeWidgets: reindexed });
};

const allTabIds = ["notes", "sport", "calendar", "ai", "library", "quiz", "tests"];
const MIN_VISIBLE_TABS = 2;

const isTabHidden = (tabId) => data.hiddenTabs.includes(tabId);

const visibleTabsCount = allTabIds.length - data.hiddenTabs.length;

const hideTab = (tabId) => {
  if (visibleTabsCount <= MIN_VISIBLE_TABS) {
    showNotification(`Минимум ${MIN_VISIBLE_TABS} вкладки должны остаться видимыми`);
    return;
  }

  const nextHidden = [...new Set([...data.hiddenTabs, tabId])];
  persist({ ...data, hiddenTabs: nextHidden });

  if (tab === tabId) {
    const nextVisible = allTabIds.find((id) => !nextHidden.includes(id));
    if (nextVisible) {
      setTab(nextVisible);
      if (nextVisible === "notes") setView("list");
    }
  }
  setNavEditingTabId(null);
};

const showTab = (tabId) => {
  persist({ ...data, hiddenTabs: data.hiddenTabs.filter((id) => id !== tabId) });
};

const navLongPressTimerRef = useRef(null);
const navLongPressFiredRef = useRef(false);

const startNavLongPress = (tabId) => {
  navLongPressFiredRef.current = false;
  navLongPressTimerRef.current = setTimeout(() => {
    navLongPressFiredRef.current = true;
    setNavEditingTabId(tabId);
    if (navigator.vibrate) navigator.vibrate(15);
  }, 500);
};

const cancelNavLongPress = () => {
  if (navLongPressTimerRef.current) clearTimeout(navLongPressTimerRef.current);
};

const saveEvent = (event) => {
  const exists = data.events.some((e) => e.id === event.id);
  const nextEvents = exists
    ? data.events.map((e) => (e.id === event.id ? event : e))
    : [...data.events, event];

  persist({ ...data, events: nextEvents });
  setEventModalOpen(false);
  setEditingEvent(null);
};

const deleteEvent = (id) => {
  const removed = data.events.find((e) => e.id === id);
  const removedIndex = data.events.findIndex((e) => e.id === id);

  persist({ ...data, events: data.events.filter((e) => e.id !== id) });
  setShowEventDeleteConfirm(null);
  setEventDetailId(null);

  if (removed) {
    triggerUndo("Событие удалено", () => {
      setData((cur) => {
        const nextEvents = [...cur.events];
        nextEvents.splice(Math.min(removedIndex, nextEvents.length), 0, removed);
        const next = { ...cur, events: nextEvents };
        saveData(next);
        return next;
      });
    });
  }
};

const toggleEventDone = (id) => {
  persist({
    ...data,
    events: data.events.map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
  });
};

const duplicateEvent = (id) => {
  const original = data.events.find((e) => e.id === id);
  if (!original) return;

  const copy = { ...original, id: makeId("evt"), title: `${original.title} (копия)`, done: false };
  persist({ ...data, events: [...data.events, copy] });
};

const getDailyLog = (dateKey) =>
  data.dailyLogs?.[dateKey] || {
    mood: null,
    energy: null,
    sleep: null,
    productivity: null,
    stress: null,
    tasks: [],
    note: "",
  };

const updateDailyLog = (dateKey, patch) => {
  const current = getDailyLog(dateKey);
  const nextLog = { ...current, ...patch };

  persist({
    ...data,
    dailyLogs: { ...data.dailyLogs, [dateKey]: nextLog },
  });
};

const addDayTask = (dateKey, text) => {
  if (!text.trim()) return;
  const current = getDailyLog(dateKey);
  const task = { id: makeId("dtask"), text: text.trim(), done: false, priority: "medium" };
  updateDailyLog(dateKey, { tasks: [...(current.tasks || []), task] });
};

const toggleDayTask = (dateKey, taskId) => {
  const current = getDailyLog(dateKey);
  updateDailyLog(dateKey, {
    tasks: (current.tasks || []).map((tk) =>
      tk.id === taskId ? { ...tk, done: !tk.done } : tk
    ),
  });
};

const deleteDayTask = (dateKey, taskId) => {
  const current = getDailyLog(dateKey);
  updateDailyLog(dateKey, {
    tasks: (current.tasks || []).filter((tk) => tk.id !== taskId),
  });
};

useEffect(() => {
  const draft = loadDraft();

  if (draft && (draft.title || draft.text || (draft.annotations && draft.annotations.length))) {
    setDraftExists(true);
  }
}, []);

useEffect(() => {
  const quizDraft = loadQuizDraft();

  if (quizDraft && (quizDraft.title || (quizDraft.questions && quizDraft.questions.some((q) => q.text)))) {
    setQuizDraftExists(true);
  }
}, []);

useEffect(() => {
  if (view === "edit" && activeNote) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    const timer = setTimeout(() => {
      saveDraft(activeNote);
      setSaveStatus("saving");

      if (activeNote.id) {
        const exists = data.notes.find((n) => n.id === activeNote.id);

        if (exists) {
          const notes = data.notes.map((n) =>
            n.id === activeNote.id
              ? { ...activeNote, updatedAt: new Date().toISOString() }
              : n
          );

          persist({ ...data, notes });
          setSaveStatus("saved");
          setDraftExists(true);
        } else if (
          activeNote.title ||
          activeNote.text ||
          (activeNote.annotations &&
            activeNote.annotations.some((b) => b && b.start < b.end))
        ) {
          const newNote = {
            ...activeNote,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          persist({ ...data, notes: [newNote, ...data.notes] });
          setActiveNote(newNote);
          setSaveStatus("saved");
          setDraftExists(true);
        } else {
          setSaveStatus("idle");
        }
      } else if (
        activeNote.title ||
        activeNote.text ||
        (activeNote.annotations &&
          activeNote.annotations.some((b) => b && b.start < b.end))
      ) {
        setSaveStatus("saved");
        setDraftExists(true);
      } else {
        setSaveStatus("idle");
      }

      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }, 2000);

    saveTimerRef.current = timer;

    return () => clearTimeout(timer);
  }
}, [activeNote, view, data]);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (
      document.hidden &&
      view === "edit" &&
      activeNote &&
      (activeNote.title ||
        activeNote.text ||
        (activeNote.annotations &&
          activeNote.annotations.some((b) => b && b.start < b.end)))
    ) {
      saveDraft(activeNote);
      setDraftExists(true);

      if (activeNote.id) {
        const exists = data.notes.find((n) => n.id === activeNote.id);

        if (exists) {
          const notes = data.notes.map((n) =>
            n.id === activeNote.id
              ? { ...activeNote, updatedAt: new Date().toISOString() }
              : n
          );

          persist({ ...data, notes });
        }
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [activeNote, view, data]);

useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (
      view === "edit" &&
      activeNote &&
      (activeNote.title ||
        activeNote.text ||
        (activeNote.annotations &&
          activeNote.annotations.some((b) => b && b.start < b.end)))
    ) {
      saveDraft(activeNote);

      e.preventDefault();
      e.returnValue = "У вас есть несохраненные изменения.";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [activeNote, view]);

const restoreDraft = () => {
  const draft = loadDraft();

  if (draft) {
    setActiveNote(draft);
    setView("edit");
    setDraftExists(false);
    clearDraft();

    showNotification("🔄 Черновик восстановлен");
  }
};

const discardDraft = () => {
  clearDraft();
  setDraftExists(false);

  showNotification("🗑️ Черновик удален");
};

const showNotification = (message) => {
  const notification = document.createElement("div");

  notification.style.cssText = `
    position: fixed;
    bottom: ${isMobile ? "80px" : "100px"};
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
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s";

    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

const addCategory = () => {
  if (!newCategoryName.trim()) return;

  const category = {
    id: Date.now(),
    name: newCategoryName,
    color: newCategoryColor,
  };

  persist({ ...data, categories: [...data.categories, category] });

  setNewCategoryName("");
  setNewCategoryColor("#C4622D");
  setShowCategoryModal(false);

  showNotification("✅ Категория создана");
};

const deleteCategory = (id) => {
  const removedCategory = data.categories.find((c) => c.id === id);
  const removedIndex = data.categories.findIndex((c) => c.id === id);
  const affectedNoteIds = data.notes.filter((n) => n.categoryId === id).map((n) => n.id);

  const notes = data.notes.map((n) =>
    n.categoryId === id ? { ...n, categoryId: null } : n
  );

  persist({
    ...data,
    categories: data.categories.filter((c) => c.id !== id),
    notes,
  });

  if (removedCategory) {
    triggerUndo("Папка удалена", () => {
      setData((cur) => {
        const nextCategories = [...cur.categories];
        nextCategories.splice(Math.min(removedIndex, nextCategories.length), 0, removedCategory);

        const affectedSet = new Set(affectedNoteIds);
        const nextNotes = cur.notes.map((n) =>
          affectedSet.has(n.id) ? { ...n, categoryId: id } : n
        );

        const next = { ...cur, categories: nextCategories, notes: nextNotes };
        saveData(next);
        return next;
      });
    });
  } else {
    showNotification("🗑️ Категория удалена");
  }
};

const triggerUndo = (message, restoreFn) => {
  if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

  setUndoAction({ message, onUndo: restoreFn });

  undoTimerRef.current = setTimeout(() => {
    setUndoAction(null);
  }, 5000);
};

const dismissUndo = () => {
  if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  setUndoAction(null);
};

const startLongPress = (kind, id) => {
  longPressFiredRef.current = false;
  longPressTimerRef.current = setTimeout(() => {
    longPressFiredRef.current = true;
    setSelectionMode(kind);
    setSelectedIds(new Set([id]));
    if (navigator.vibrate) navigator.vibrate(15);
  }, 500);
};

const cancelLongPress = () => {
  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
};

const toggleSelected = (id) => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};

const exitSelectionMode = () => {
  setSelectionMode(null);
  setSelectedIds(new Set());
};

const newNote = () => {
  const draft = loadDraft();

  if (draft && (draft.title || draft.text || draft.annotations)) {
    if (window.confirm("У вас есть несохраненный черновик. Использовать его?")) {
      setActiveNote(draft);
      setView("edit");
      clearDraft();
      setDraftExists(false);

        return;
      }
    }

    setActiveNote({
      id: Date.now(),
      title: "",
      text: "",
      annotations: [],
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

    const normalizedNote = {
      ...note,
      annotations: normalizeAnnotations(note.annotations || []),
      text: note.text || "",
    };

    const notes = exists
      ? data.notes.map((n) => (n.id === note.id ? normalizedNote : n))
      : [normalizedNote, ...data.notes];

    persist({ ...data, notes });

    clearDraft();
    setDraftExists(false);
    setView("list");

    showNotification("✅ Заметка сохранена");
  };

  const deleteNote = (id) => {
    setShowDeleteConfirm(null);

    const removedNote = data.notes.find((n) => n.id === id);
    const removedIndex = data.notes.findIndex((n) => n.id === id);

    persist({ ...data, notes: data.notes.filter((n) => n.id !== id) });

    clearDraft();
    setDraftExists(false);
    setView("list");

    if (removedNote) {
      triggerUndo("Элемент удалён", () => {
        setData((cur) => {
          const nextNotes = [...cur.notes];
          nextNotes.splice(Math.min(removedIndex, nextNotes.length), 0, removedNote);
          const next = { ...cur, notes: nextNotes };
          saveData(next);
          return next;
        });
      });
    }
  };

  const duplicateNote = (id) => {
    const original = data.notes.find((n) => n.id === id);
    if (!original) return;

    const copy = {
      ...original,
      id: makeId("note"),
      title: `${original.title || "Без названия"} (копия)`,
      createdAt: new Date().toISOString(),
    };

    persist({ ...data, notes: [copy, ...data.notes] });
  };

  const bulkDeleteNotes = (ids) => {
    const idSet = new Set(ids);
    const removed = data.notes.filter((n) => idSet.has(n.id));
    if (removed.length === 0) return;

    persist({ ...data, notes: data.notes.filter((n) => !idSet.has(n.id)) });
    exitSelectionMode();

    triggerUndo(
      removed.length > 1 ? `Удалено элементов: ${removed.length}` : "Элемент удалён",
      () => {
        setData((cur) => {
          const next = { ...cur, notes: [...removed, ...cur.notes] };
          saveData(next);
          return next;
        });
      }
    );
  };

  const bulkDuplicateNotes = (ids) => {
    const idSet = new Set(ids);
    const originals = data.notes.filter((n) => idSet.has(n.id));
    const copies = originals.map((n) => ({
      ...n,
      id: makeId("note"),
      title: `${n.title || "Без названия"} (копия)`,
      createdAt: new Date().toISOString(),
    }));

    persist({ ...data, notes: [...copies, ...data.notes] });
    exitSelectionMode();
    showNotification(copies.length > 1 ? `📄 Продублировано: ${copies.length}` : "📄 Копия создана");
  };

  const bulkMoveNotes = (ids, categoryId) => {
    const idSet = new Set(ids);
    const notes = data.notes.map((n) => (idSet.has(n.id) ? { ...n, categoryId } : n));

    persist({ ...data, notes });
    exitSelectionMode();
    setShowMoveModal(false);
    showNotification("📂 Перемещено");
  };

  const bulkSendNotesToAI = (ids) => {
    const idSet = new Set(ids);
    const notes = data.notes.filter((n) => idSet.has(n.id));
    const combined = notes
      .map((n) => `Заметка: ${n.title || "Без названия"}\n${n.text || ""}`)
      .join("\n\n---\n\n");

    exitSelectionMode();
    setTab("ai");
    setChatInput((prev) => (prev ? `${prev}\n\n${combined}` : combined));
    showNotification("🤖 Заметки добавлены в поле ввода ИИ");
  };

  const filtered = data.notes.filter((n) => {
    const tags = n.tags || [];
    const q = search.toLowerCase();

    const matchSearch =
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.text && n.text.toLowerCase().includes(q)) ||
      tags.some((tag) => tag.toLowerCase().includes(q));

    const matchCategory = activeCategory === null || n.categoryId === activeCategory;

    return matchSearch && matchCategory;
  });

  const notesContext = filtered
    .slice(0, 20)
    .map((n) => {
      const text = n.text || "";

      return `[${n.title}]: ${text.slice(0, 300)}`;
    })
    .join("\n\n");

  const libraryContext = data.library
    .slice(0, 10)
    .map((item) => `[${item.name}]: ${item.content.slice(0, 500)}`)
    .join("\n\n");

  const aiSummarize = async (note) => {
    setAiLoading(true);

    try {
      const reply = await askAI(
        [
          {
            role: "user",
            content: `Сделай краткое резюме этой заметки и предложи 3 вопроса для самопроверки:\n\n${note.title}\n${note.text || ""}`,
          },
        ],
        "Ты помощник для учёбы. Отвечай на русском."
      );

      const updatedNote = { ...note, aiSummary: reply };

      setActiveNote(updatedNote);

      const exists = data.notes.find((n) => n.id === note.id);

      if (exists) {
        const notes = data.notes.map((n) => (n.id === note.id ? updatedNote : n));

        persist({ ...data, notes });
      } else {
        persist({ ...data, notes: [updatedNote, ...data.notes] });
      }
    } catch (err) {
      console.error("aiSummarize error:", err);
    } finally {
      setAiLoading(false);
    }
  };

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

    return () => el.removeEventListener("scroll", onScroll);
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
    const s = useMemo(() => {
  const fs = fontScale || 1;
  const fontSize = {
    xs: Math.round((isMobile ? 10 : 12) * fs),
    sm: Math.round((isMobile ? 13 : 15) * fs),
    md: Math.round((isMobile ? 15 : 17) * fs),
    lg: Math.round((isMobile ? 18 : 22) * fs),
    xl: Math.round((isMobile ? 20 : 26) * fs),
  };

  const activeFontStack =
    (FONT_FAMILIES[fontFamily] || FONT_FAMILIES.system).stack;

  return {
    app: {
      minHeight: "100vh",
      background: t.bg,
      color: t.text,
      fontFamily: activeFontStack,
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
      minHeight: isMobile ? (isLandscape ? "60px" : "56px") : "72px",
    },

    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: 700,
      letterSpacing: "-0.3px",
      flex: 1,
      color: t.accent,
    },

    content: {
      flex: 1,
      padding: contentPadding,
      overflowY: "auto",
      animation: "fadeIn 0.4s ease-in",
      overflowX: "hidden",
      paddingBottom: bottomNavPadding,
    },

    card: {
      background: t.card,
      borderRadius: 16,
      padding: cardPadding,
      marginBottom: 14,
      border: `1.5px solid ${t.border}`,
      cursor: "pointer",
      transition: "all 0.3s",
      animation: "slideUp 0.4s ease-out",
    },

    cardTitle: {
      fontSize: fontSize.md,
      fontWeight: 600,
      marginBottom: 6,
      color: t.text,
      letterSpacing: "-0.1px",
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
      padding: isMobile
        ? isLandscape
          ? "12px 20px"
          : "10px 16px"
        : "14px 28px",
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: isMobile ? fontSize.sm : fontSize.md,
      display: "flex",
      alignItems: "center",
      gap: 6,
      transition: "all 0.2s",
      fontFamily: "inherit",
      ...(variant === "primary"
        ? { background: t.accent, color: "#FAF7F2" }
        : variant === "danger"
        ? { background: `${t.danger}18`, color: t.danger, border: `1.5px solid ${t.danger}33` }
        : variant === "ghost"
        ? { background: "transparent", color: t.textMuted }
        : { background: t.card, color: t.text, border: `1.5px solid ${t.border}` }),
    }),

    input: {
      width: "100%",
      background: t.card,
      border: `1.5px solid ${t.border}`,
      borderRadius: 10,
      padding: isMobile ? "10px 12px" : "12px 16px",
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
      border: `1.5px solid ${t.border}`,
      borderRadius: 10,
      padding: isMobile ? "10px 12px" : "12px 16px",
      color: t.text,
      fontSize: fontSize.sm,
      outline: "none",
      resize: "vertical",
      minHeight: isMobile ? "120px" : "200px",
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
      padding: isMobile ? "10px 14px" : "12px 18px",
      borderRadius: isUser
        ? "18px 18px 4px 18px"
        : "18px 18px 18px 4px",
      background: isUser ? t.accent : t.card,
      color: isUser ? "#FAF7F2" : t.text,
      fontSize: fontSize.sm,
      lineHeight: 1.5,
      border: isUser ? "none" : `1.5px solid ${t.border}`,
      alignSelf: isUser ? "flex-end" : "flex-start",
      whiteSpace: "pre-wrap",
      animation: "fadeIn 0.3s ease-in",
      wordBreak: "break-word",
    }),

    empty: {
      textAlign: "center",
      padding: isMobile ? "60px 20px" : "80px 40px",
      color: t.textMuted,
    },

    categoryBadge: (color) => ({
      display: "inline-block",
      background: `${color}1F`,
      color: color,
      borderRadius: 20,
      padding: "4px 12px",
      fontSize: fontSize.xs,
      fontWeight: 600,
      marginRight: 6,
      marginBottom: 8,
      cursor: "pointer",
      border: `1.5px solid ${color}55`,
    }),

    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `rgba(${t.shadow}, 0.55)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      animation: "fadeIn 0.2s ease-out",
      padding: "20px",
    },

    modalContent: {
      background: t.card,
      borderRadius: 18,
      padding: isMobile ? "20px" : "28px",
      width: "90%",
      maxWidth: isMobile ? "400px" : "600px",
      border: `1.5px solid ${t.border}`,
      animation: "slideUp 0.3s ease-out",
      maxHeight: "90vh",
      overflowY: "auto",
    },

    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: maxWidth,
      background: t.surface,
      borderTop: `1.5px solid ${t.border}`,
      display: "flex",
      padding: isMobile ? "8px 0" : "12px 0",
      justifyContent: "space-around",
      zIndex: 10,
      transition: "background 0.3s, border-color 0.3s",
      backdropFilter: "blur(10px)",
    },

    navButton: (active) => ({
      flex: "1",
      padding: isMobile ? "8px 4px" : "12px 8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      background: "none",
      border: "none",
      color: active ? t.accent : t.textMuted,
      fontSize: isMobile ? 10 : 12,
      fontWeight: active ? 700 : 500,
      cursor: "pointer",
      transition: "all 0.3s",
      position: "relative",
      borderTop: active ? `2.5px solid ${t.accent}` : "2.5px solid transparent",
    }),

    navIcon: { fontSize: isMobile ? 20 : 24 },
    navLabel: { fontSize: isMobile ? 9 : 11, marginTop: 2 },
  };
}, [
  t,
  theme,
  isMobile,
  isLandscape,
  maxWidth,
  headerPadding,
  contentPadding,
  cardPadding,
  bottomNavPadding,
  fontScale,
  fontFamily,
]);
  const SaveIndicator = () => {
  if (saveStatus === "idle" && !draftExists) return null;

  let statusText = "";
  let statusColor = t.textMuted;

  if (saveStatus === "saving") {
    statusText = "💾 Сохранение...";
    statusColor = t.warning;
  } else if (saveStatus === "saved") {
    statusText = "✅ Сохранено";
    statusColor = t.success;
  } else if (draftExists && view !== "edit") {
    statusText = "📝 Есть черновик";
    statusColor = t.accent;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? 80 : 100,
        right: 20,
        padding: "8px 16px",
        borderRadius: 8,
        background: t.surface,
        border: `1px solid ${statusColor}`,
        color: statusColor,
        fontSize: 12,
        zIndex: 1000,
        transition: "all 0.3s",
        boxShadow: `0 4px 12px rgba(${t.shadow}, 0.18)`,
        maxWidth: "90%",
      }}
    >
      {statusText}
    </div>
  );
};

const UndoSnackbar = () => {
  if (!undoAction) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? 78 : 96,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(420px, 92%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        background: theme === "dark" ? "#1A1714" : "#2A241D",
        color: "#F5EFE6",
        boxShadow: `0 8px 24px rgba(${t.shadow}, 0.35)`,
        zIndex: 2500,
        animation: "slideUp 0.25s ease-out",
      }}
    >
      <div style={{ fontSize: 13.5 }}>{undoAction.message}</div>
      <button
        onClick={() => {
          undoAction.onUndo();
          dismissUndo();
        }}
        style={{
          background: "none",
          border: "none",
          color: t.accent,
          fontWeight: 700,
          fontSize: 13.5,
          cursor: "pointer",
          padding: "4px 8px",
          flexShrink: 0,
        }}
      >
        ОТМЕНИТЬ
      </button>
    </div>
  );
};

const renderNotes = () => {
  if (view === "edit") {
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
        allNotes={data.notes}
      />
    );
  }

  if (view === "detail") {
    return (
      <NoteDetail
        note={activeNote}
        categories={data.categories}
        onEdit={() => setView("edit")}
        onDelete={() => setShowDeleteConfirm(activeNote.id)}
        onSummarize={() => aiSummarize(activeNote)}
        aiLoading={aiLoading}
        theme={t}
        s={s}
        onOpenSubnote={(id) => setSubnoteOpenId(id)}
        isTablet={isTablet}
        isLandscape={isLandscape}
      />
    );
  }

  return (
    <div>
      {data.activeWidgets.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: s.label.fontSize,
              fontWeight: 600,
              color: t.textMuted,
              marginBottom: 10,
            }}
          >
            📌 ВИДЖЕТЫ
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...data.activeWidgets]
              .sort((a, b) => a.order - b.order)
              .map((widget) => {
                if (widget.id === "sport") {
                  return (
                    <div
                      key={widget.id}
                      style={{
                        ...s.card,
                        borderLeft: `4px solid ${widget.color || t.accent}`,
                      }}
                      onClick={() => {
                        setTab("sport");
                        setSportView("dashboard");
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ fontSize: 22 }}>🏃</div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, flex: 1 }}>Спорт</div>
                      </div>
                      <div style={{ display: "flex", gap: 18 }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>
                            {weekWorkoutStats.count}
                          </div>
                          <div style={{ fontSize: 11, color: t.textMuted }}>тренировок за неделю</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>
                            {weekWorkoutStats.streak}
                          </div>
                          <div style={{ fontSize: 11, color: t.textMuted }}>дней подряд</div>
                        </div>
                      </div>
                      {lastThreeWorkouts[0] && (
                        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 10 }}>
                          Последняя: {lastThreeWorkouts[0].title} · {formatWorkoutDate(lastThreeWorkouts[0].startTime)}
                        </div>
                      )}
                    </div>
                  );
                }

                if (widget.id === "calendar") {
                  const todayK = todayKey();
                  const todaysEvents = (eventsByDateKey[todayK] || []).slice(0, 3);

                  return (
                    <div
                      key={widget.id}
                      style={{
                        ...s.card,
                        borderLeft: `4px solid ${widget.color || t.accent}`,
                      }}
                      onClick={() => {
                        setTab("calendar");
                        setCalendarSelectedDate(todayK);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ fontSize: 22 }}>📅</div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, flex: 1 }}>
                          {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                        </div>
                        <div style={{ fontSize: 12, color: t.textMuted }}>
                          {todaysEvents.length} событ{todaysEvents.length === 1 ? "ие" : "ий"}
                        </div>
                      </div>

                      {todaysEvents.length === 0 ? (
                        <div style={{ fontSize: 12.5, color: t.textMuted }}>Событий на сегодня нет</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {todaysEvents.map((ev) => (
                            <div key={ev.id} style={{ display: "flex", gap: 8, fontSize: 12.5 }}>
                              <span style={{ color: t.textMuted, minWidth: 38 }}>
                                {ev.startTime ? formatEventTime(ev.startTime) : "—"}
                              </span>
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ev.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })}
          </div>
        </div>
      )}

      <div
        style={{
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            ...s.row,
            marginBottom: 12,
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: s.label.fontSize,
              fontWeight: 600,
              color: t.textMuted,
            }}
          >
            📂 КАТЕГОРИИ
          </div>

          <button style={s.btn("ghost")} onClick={() => setShowCategoryModal(true)}>
            <Icon d={icons.plus} size={14} color={t.text} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            overflowX: "auto",
          }}
        >
          <button
            style={{
              ...s.categoryBadge(t.accent),
              border:
                activeCategory === null
                  ? `2px solid ${t.accent}`
                  : `1px solid ${t.accent}66`,
              background:
                activeCategory === null
                  ? `${t.accent}44`
                  : `${t.accent}22`,
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
                  border:
                    activeCategory === cat.id
                      ? `2px solid ${cat.color}`
                      : `1px solid ${cat.color}66`,
                  background:
                    activeCategory === cat.id
                      ? `${cat.color}44`
                      : `${cat.color}22`,
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

                  if (
                    window.confirm(
                      `Удалить категорию "${cat.name}"? Заметки станут "без категории"`
                    )
                  ) {
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

      {draftExists && (
        <div
          style={{
            padding: "12px 16px",
            background: `${t.accent}22`,
            borderRadius: 8,
            marginBottom: 12,
            border: `1px solid ${t.accent}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>📝 У вас есть несохраненный черновик</span>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.btn("primary")} onClick={restoreDraft}>
              Восстановить
            </button>

            <button style={s.btn("ghost")} onClick={discardDraft}>
              Удалить
            </button>
          </div>
        </div>
      )}

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
            <Icon d={icons.search} size={16} color={t.textMuted} />
          </span>

          <input
            style={{ ...s.input, paddingLeft: 34 }}
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button style={s.btn("primary")} onClick={newNote}>
          <Icon d={icons.plus} size={16} color="#fff" /> {!isMobile && "Новая"}
        </button>
      </div>

      {selectionMode === "notes" && selectedIds.size > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 12,
            background: `${t.accent}14`,
            border: `1.5px solid ${t.accent}55`,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: t.accent, marginRight: "auto" }}>
            Выбрано: {selectedIds.size}
          </div>
          <button style={s.btn("ghost")} onClick={() => bulkDuplicateNotes([...selectedIds])} title="Дублировать">
            <Icon d={icons.copy} size={16} color={t.text} />
          </button>
          <button style={s.btn("ghost")} onClick={() => setShowMoveModal(true)} title="Перенести">
            <Icon d={icons.folder} size={16} color={t.text} />
          </button>
          <button style={s.btn("ghost")} onClick={() => bulkSendNotesToAI([...selectedIds])} title="Отправить в ИИ">
            <Icon d={icons.ai} size={16} color={t.text} />
          </button>
          <button style={s.btn("danger")} onClick={() => bulkDeleteNotes([...selectedIds])} title="Удалить">
            <Icon d={icons.trash} size={16} color={t.danger} />
          </button>
          <button style={s.btn("ghost")} onClick={exitSelectionMode} title="Отменить выбор">
            ✕
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Нет заметок</div>

          <div style={{ fontSize: 13 }}>
            {activeCategory !== null
              ? "Создайте заметку в этой категории"
              : "Создайте первую заметку"}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: isTablet ? 16 : 12,
          }}
        >
          {filtered.map((note) => {
            const cat = data.categories.find((c) => c.id === note.categoryId);
            const isSelected = selectionMode === "notes" && selectedIds.has(note.id);

            return (
              <div
                key={note.id}
                style={{
                  ...s.card,
                  position: "relative",
                  border: isSelected ? `2px solid ${t.accent}` : s.card.border,
                  background: isSelected ? `${t.accent}0D` : s.card.background,
                }}
                onMouseDown={() => startLongPress("notes", note.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress("notes", note.id)}
                onTouchEnd={cancelLongPress}
                onClick={() => {
                  if (longPressFiredRef.current) {
                    longPressFiredRef.current = false;
                    return;
                  }
                  if (selectionMode === "notes") {
                    toggleSelected(note.id);
                    return;
                  }
                  setActiveNote(note);
                  setView("detail");
                }}
              >
                {selectionMode === "notes" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? t.accent : t.border}`,
                      background: isSelected ? t.accent : t.card,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && <Icon d="M20 6L9 17l-5-5" size={12} color="#FAF7F2" />}
                  </div>
                )}

                <div style={s.cardTitle}>{note.title || "Без названия"}</div>

                <div style={s.cardText}>
                  {note.text ? note.text.slice(0, 200) : ""}
                </div>

                <div style={{ marginTop: 8 }}>
                  {cat && <span style={s.categoryBadge(cat.color)}>{cat.name}</span>}

                  {note.tags &&
                    note.tags.map((tag) => (
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

                  <span
                    style={{
                      fontSize: 11,
                      color: t.textMuted,
                      float: "right",
                      marginTop: 2,
                    }}
                  >
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
      const reply = await askAI(
        history.map((m) => ({ role: m.role, content: m.content })),
        systemPrompt
      );

      persist({
        ...data,
        chatHistory: [...history, { role: "assistant", content: reply }],
      });
    } catch (_) {
      persist({
        ...data,
        chatHistory: [
          ...history,
          { role: "assistant", content: "Ошибка соединения. Попробуйте снова." },
        ],
      });
    }

    setChatLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - " + (isMobile ? "180px" : "200px") + ")",
      }}
    >
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
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              paddingRight: m.role === "user" ? 0 : 8,
              paddingLeft: m.role === "user" ? 8 : 0,
            }}
          >
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
          disabled={chatLoading}
        />

        <button
          style={{ ...s.btn("primary"), padding: "10px 14px" }}
          onClick={sendChat}
          disabled={chatLoading}
        >
          <Icon d={icons.send} size={16} color="#fff" />
        </button>

        {data.chatHistory.length > 0 && (
          <button
            style={s.btn("ghost")}
            onClick={() => persist({ ...data, chatHistory: [] })}
            title="Очистить"
          >
            <Icon d={icons.trash} size={16} color={t.textMuted} />
          </button>
        )}
      </div>
    </div>
  );
};

const renderLibrary = () => {
  const handleAddToLibrary = () => {
    if (libName.trim() && libContent.trim()) {
      const libraryItem = {
        id: Date.now(),
        name: libName,
        content: libContent,
        type: "file",
        uploadedAt: new Date().toISOString(),
      };

      persist({ ...data, library: [...data.library, libraryItem] });

      setLibName("");
      setLibContent("");

      showNotification("📚 Файл добавлен в библиотеку");
    }
  };

  const deleteFromLibrary = (id) => {
    persist({
      ...data,
      library: data.library.filter((item) => item.id !== id),
    });

    showNotification("🗑️ Файл удален из библиотеки");
  };

  const filteredLibraryItems = filteredLibrary;

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ ...s.row, marginBottom: 12, gap: 8 }}>
          <input
            type="text"
            style={{ ...s.input, flex: 1 }}
            placeholder="Название файла..."
            value={libName}
            onChange={(e) => setLibName(e.target.value)}
          />

          <button style={s.btn("primary")} onClick={handleAddToLibrary}>
            <Icon d={icons.upload} size={16} color="#fff" /> {!isMobile && "Добавить"}
          </button>
        </div>

        <textarea
          style={{ ...s.textarea, marginBottom: 12 }}
          placeholder="Вставьте содержимое..."
          rows={isTablet ? 6 : 4}
          value={libContent}
          onChange={(e) => setLibContent(e.target.value)}
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
            <Icon d={icons.search} size={16} color={t.textMuted} />
          </span>

          <input
            style={{ ...s.input, paddingLeft: 34 }}
            placeholder="Поиск..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
          />
        </div>
      </div>

      {filteredLibraryItems.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>

          <div style={{ fontWeight: 600, marginBottom: 4 }}>Библиотека пуста</div>

          <div style={{ fontSize: 13 }}>Добавьте файлы для анализа</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: isTablet ? 16 : 12,
          }}
        >
          {filteredLibraryItems.map((item) => (
            <div key={item.id} style={s.card}>
              <div
                style={{
                  ...s.row,
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div style={s.cardTitle}>{item.name}</div>

                <div style={s.row}>
                  <button
                    style={s.btn("ghost")}
                    onClick={() => {
                      setChatInput(
                        `Проанализируй это из библиотеки: "${item.name}"\n\n${item.content.slice(
                          0,
                          200
                        )}...`
                      );

                      setTab("ai");
                    }}
                    title="Отправить в чат"
                  >
                    <Icon d={icons.send} size={14} color={t.textMuted} />
                  </button>

                  <button
                    style={s.btn("danger")}
                    onClick={() => deleteFromLibrary(item.id)}
                    title="Удалить"
                  >
                    <Icon d={icons.trash} size={14} color={t.danger} />
                  </button>
                </div>
              </div>

              <div style={{ ...s.cardText, display: "block" }}>
                {item.content.slice(0, 200)}...
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: t.textMuted,
                  marginTop: 8,
                }}
              >
                {new Date(item.uploadedAt).toLocaleDateString("ru")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const renderChecklists = () => {
  if (checklistView === "editor") {
    return (
      <ChecklistEditor
        checklist={editingChecklist}
        onSave={saveChecklist}
        onCancel={() => {
          setEditingChecklist(null);
          setChecklistView(activeChecklistId ? "detail" : "list");
        }}
        theme={t}
        s={s}
      />
    );
  }

  if (checklistView === "detail" && activeChecklistId) {
    const checklist = data.checklists.find((c) => c.id === activeChecklistId);

    if (!checklist) {
      setChecklistView("list");
      return null;
    }

    return (
      <ChecklistDetail
        checklist={checklist}
        onToggleItem={toggleChecklistItem}
        onEdit={() => {
          setEditingChecklist(checklist);
          setChecklistView("editor");
        }}
        onDelete={() => setShowChecklistDeleteConfirm(checklist.id)}
        theme={t}
        s={s}
      />
    );
  }

  if (data.checklists.length === 0) {
    return (
      <div style={s.empty}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Чек-листов пока нет</div>
        <div style={{ fontSize: 13, marginBottom: 16 }}>
          Создайте чек-лист для тренировок, питания, дикции — чего угодно.
        </div>
        <button
          style={s.btn("primary")}
          onClick={() => {
            setEditingChecklist(null);
            setChecklistView("editor");
          }}
        >
          <Icon d={icons.plus} size={16} color="#fff" /> Создать чек-лист
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        style={{ ...s.btn("primary"), marginBottom: 16 }}
        onClick={() => {
          setEditingChecklist(null);
          setChecklistView("editor");
        }}
      >
        <Icon d={icons.plus} size={16} color="#fff" /> Новый чек-лист
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gap: isTablet ? 16 : 12,
        }}
      >
        {data.checklists.map((checklist) => {
          const isHabit = checklist.type === "habit";
          const key = todayKey();
          const todayIdx = todayWeekday();
          const dayProgress = isHabit ? checklist.progressByDate?.[key] || {} : null;
          const isDone = (item) => (isHabit ? !!dayProgress[item.id] : !!item.done);

          const todayGroups = isHabit
            ? checklist.perDay
              ? checklist.contentByDay?.[todayIdx] || []
              : checklist.groups || []
            : checklist.groups || [];

          const allItems = todayGroups.flatMap((g) => g.items);
          const completedCount = allItems.filter(isDone).length;
          const total = allItems.length;
          const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
          const activeToday = !isHabit || checklist.days.includes(todayIdx);

          const totalGroupsAcrossWeek = checklist.perDay
            ? new Set(
                Object.values(checklist.contentByDay || {})
                  .flat()
                  .map((g) => g.id)
              ).size
            : (checklist.groups || []).length;

          return (
            <div
              key={checklist.id}
              style={{ ...s.card, opacity: isHabit && !activeToday ? 0.55 : 1 }}
              onClick={() => {
                setActiveChecklistId(checklist.id);
                setChecklistView("detail");
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 22 }}>{checklist.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.cardTitle}>{checklist.title}</div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>
                    {isHabit
                      ? activeToday
                        ? "Сегодня в расписании"
                        : "Не сегодня"
                      : "Разовый список"}{" "}
                    · {totalGroupsAcrossWeek}{" "}
                    {totalGroupsAcrossWeek === 1 ? "блок" : "блока"}
                    {isHabit && activeToday ? ` · ${completedCount}/${total}` : ""}
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: 5,
                  borderRadius: 3,
                  background: t.border,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${total > 0 ? pct : 0}%`,
                    background: pct === 100 && total > 0 ? t.success : t.accent,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const renderTests = () => {
  if (quizView === "import") {
    return (
      <QuizImport
        onImported={(quizzes) => {
          const nextQuizzes = [...data.quizzes, ...quizzes];
          persist({ ...data, quizzes: nextQuizzes });
          setActiveQuizId(quizzes[0].id);
          setQuizView("detail");
          showNotification(
            quizzes.length > 1 ? `✅ Импортировано тестов: ${quizzes.length}` : "✅ Тест импортирован"
          );
        }}
        onCancel={() => setQuizView("list")}
        theme={t}
        s={s}
      />
    );
  }

  if (quizView === "editor") {
    return (
      <QuizEditor
        quiz={editingQuiz}
        onSave={saveQuiz}
        onCancel={() => {
          setEditingQuiz(null);
          setQuizView(activeQuizId ? "detail" : "list");
        }}
        theme={t}
        s={s}
      />
    );
  }

  if (quizView === "detail" && activeQuizId) {
    const quiz = data.quizzes.find((q) => q.id === activeQuizId);

    if (!quiz) {
      setQuizView("list");
      return null;
    }

    return (
      <QuizDetail
        quiz={quiz}
        onEdit={() => {
          setEditingQuiz(quiz);
          setQuizView("editor");
        }}
        onDelete={() => setShowQuizDeleteConfirm(quiz.id)}
        onStart={() => {
          setQuizAttempt(quiz.id);
          setQuizView("play");
        }}
        onResetHistory={() => resetQuizHistory(quiz.id)}
        theme={t}
        s={s}
      />
    );
  }

  if (quizView === "play" && activeQuizId) {
    const quiz = data.quizzes.find((q) => q.id === activeQuizId);
    if (!quiz) {
      setQuizView("list");
      return null;
    }

    return (
      <QuizPlayer
        quiz={quiz}
        onCancel={() => setQuizView("detail")}
        onFinish={(result) => {
          recordQuizAttempt(quiz.id, result);
          setLastQuizResult(result);
          setQuizView("results");
        }}
        theme={t}
        s={s}
      />
    );
  }

  if (quizView === "results" && activeQuizId && lastQuizResult) {
    const quiz = data.quizzes.find((q) => q.id === activeQuizId);
    if (!quiz) {
      setQuizView("list");
      return null;
    }

    return (
      <QuizResults
        quiz={quiz}
        result={lastQuizResult}
        onClose={() => {
          setLastQuizResult(null);
          setQuizView("detail");
        }}
        onShare={() => {
          const report =
            `Тест: ${quiz.title}\n` +
            `Результат: ${lastQuizResult.scorePercent}% (${lastQuizResult.correct}/${lastQuizResult.total})\n` +
            `Время: ${Math.floor(lastQuizResult.durationSec / 60)} мин ${lastQuizResult.durationSec % 60} сек`;

          if (navigator.share) {
            navigator.share({ title: "Результат теста", text: report }).catch(() => {});
          } else if (navigator.clipboard) {
            navigator.clipboard.writeText(report);
            showNotification("📋 Отчёт скопирован в буфер обмена");
          }
        }}
        theme={t}
        s={s}
      />
    );
  }

  if (data.quizzes.length === 0) {
    return (
      <div style={s.empty}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Тестов пока нет</div>
        <div style={{ fontSize: 13, marginBottom: 16 }}>
          Импортируйте тест из файла или создайте вручную.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button style={s.btn("primary")} onClick={() => setQuizView("import")}>
            <Icon d={icons.upload} size={16} color="#FAF7F2" /> Импортировать
          </button>
          <button
            style={s.btn("secondary")}
            onClick={() => {
              setEditingQuiz(null);
              setQuizView("editor");
            }}
          >
            <Icon d={icons.plus} size={16} color={t.text} /> Создать
          </button>
        </div>
      </div>
    );
  }

  const q = quizSearch.trim().toLowerCase();
  const filteredQuizzes = data.quizzes.filter((quiz) => {
    if (!q) return true;
    const inTitle = quiz.title.toLowerCase().includes(q);
    const inDescription = (quiz.description || "").toLowerCase().includes(q);
    const inQuestions = quiz.questions.some((qs) => qs.text.toLowerCase().includes(q));
    return inTitle || inDescription || inQuestions;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={{ ...s.btn("primary"), flex: 1, justifyContent: "center" }} onClick={() => setQuizView("import")}>
          <Icon d={icons.upload} size={16} color="#FAF7F2" /> Импортировать
        </button>
        <button
          style={{ ...s.btn("secondary"), flex: 1, justifyContent: "center" }}
          onClick={() => {
            setEditingQuiz(null);
            setQuizView("editor");
          }}
        >
          <Icon d={icons.plus} size={16} color={t.text} /> Создать
        </button>
      </div>

      {quizDraftExists && (
        <div
          style={{
            padding: "12px 16px",
            background: `${t.accent}22`,
            borderRadius: 12,
            marginBottom: 16,
            border: `1px solid ${t.accent}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13.5 }}>🧪 Есть несохранённый черновик теста</span>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={s.btn("primary")}
              onClick={() => {
                const draft = loadQuizDraft();
                if (draft) {
                  setEditingQuiz(draft.id ? data.quizzes.find((q) => q.id === draft.id) || draft : draft);
                  setQuizView("editor");
                }
              }}
            >
              Восстановить
            </button>
            <button
              style={s.btn("ghost")}
              onClick={() => {
                clearQuizDraft();
                setQuizDraftExists(false);
              }}
            >
              Удалить
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "relative", marginBottom: 16 }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <Icon d={icons.search} size={16} color={t.textMuted} />
        </div>
        <input
          value={quizSearch}
          onChange={(e) => setQuizSearch(e.target.value)}
          placeholder="Поиск по тестам..."
          style={{ ...s.input, paddingLeft: 36 }}
        />
      </div>

      {selectionMode === "tests" && selectedIds.size > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 12,
            background: `${t.accent}14`,
            border: `1.5px solid ${t.accent}55`,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: t.accent, marginRight: "auto" }}>
            Выбрано: {selectedIds.size}
          </div>
          <button style={s.btn("ghost")} onClick={() => bulkDuplicateQuizzes([...selectedIds])} title="Дублировать">
            <Icon d={icons.copy} size={16} color={t.text} />
          </button>
          <button style={s.btn("ghost")} onClick={() => bulkSendQuizzesToAI([...selectedIds])} title="Отправить в ИИ">
            <Icon d={icons.ai} size={16} color={t.text} />
          </button>
          <button style={s.btn("danger")} onClick={() => bulkDeleteQuizzes([...selectedIds])} title="Удалить">
            <Icon d={icons.trash} size={16} color={t.danger} />
          </button>
          <button style={s.btn("ghost")} onClick={exitSelectionMode} title="Отменить выбор">
            ✕
          </button>
        </div>
      )}

      {filteredQuizzes.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: t.textMuted, fontSize: 13 }}>
          Ничего не найдено
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: isTablet ? 16 : 12,
          }}
        >
          {filteredQuizzes.map((quiz) => {
            const lastAttempt = quiz.history?.[0];
            const isSelected = selectionMode === "tests" && selectedIds.has(quiz.id);
            return (
              <div
                key={quiz.id}
                style={{
                  ...s.card,
                  position: "relative",
                  border: isSelected ? `2px solid ${t.accent}` : s.card.border,
                  background: isSelected ? `${t.accent}0D` : s.card.background,
                }}
                onMouseDown={() => startLongPress("tests", quiz.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress("tests", quiz.id)}
                onTouchEnd={cancelLongPress}
                onClick={() => {
                  if (longPressFiredRef.current) {
                    longPressFiredRef.current = false;
                    return;
                  }
                  if (selectionMode === "tests") {
                    toggleSelected(quiz.id);
                    return;
                  }
                  setActiveQuizId(quiz.id);
                  setQuizView("detail");
                }}
              >
                {selectionMode === "tests" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? t.accent : t.border}`,
                      background: isSelected ? t.accent : t.card,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && <Icon d="M20 6L9 17l-5-5" size={12} color="#FAF7F2" />}
                  </div>
                )}

                <div style={s.cardTitle}>🧪 {quiz.title}</div>
                <div style={{ fontSize: 12.5, color: t.textMuted, marginBottom: 8 }}>
                  {quiz.questions.length} {quiz.questions.length === 1 ? "вопрос" : "вопросов"}
                </div>
                {lastAttempt && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color:
                        lastAttempt.scorePercent >= 70
                          ? t.success
                          : lastAttempt.scorePercent >= 40
                          ? t.warning
                          : t.danger,
                    }}
                  >
                    Последний результат: {lastAttempt.scorePercent}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
// --- Спорт: справочники и помощники ---
const WORKOUT_TYPES = {
  run: { label: "Бег", icon: "🏃" },
  strength: { label: "Силовая", icon: "🏋️" },
  yoga: { label: "Йога", icon: "🧘" },
  swim: { label: "Плавание", icon: "🏊" },
  bike: { label: "Велосипед", icon: "🚴" },
  walk: { label: "Ходьба", icon: "🚶" },
};
const DISTANCE_TYPES = new Set(["run", "swim", "bike", "walk"]);

const workoutMatchesFilters = (w) => {
  if (sportFilterType !== "all" && w.type !== sportFilterType) return false;

  if (sportFilterPeriod !== "all") {
    const wDate = new Date(w.startTime);
    const now = new Date();
    if (sportFilterPeriod === "today") {
      if (dateKeyFor(wDate) !== todayKey()) return false;
    } else if (sportFilterPeriod === "week") {
      const monday = getMonday(now);
      const weekEnd = new Date(monday);
      weekEnd.setDate(weekEnd.getDate() + 7);
      if (wDate < monday || wDate >= weekEnd) return false;
    } else if (sportFilterPeriod === "month") {
      if (wDate.getMonth() !== now.getMonth() || wDate.getFullYear() !== now.getFullYear()) return false;
    }
  }

  if (sportSearch.trim()) {
    const q = sportSearch.trim().toLowerCase();
    const haystack = `${w.title} ${w.note || ""} ${(w.tags || []).join(" ")}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
};

const filteredWorkouts = useMemo(
  () =>
    [...data.workouts]
      .filter(workoutMatchesFilters)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
  [data.workouts, sportFilterType, sportFilterPeriod, sportSearch]
);

const weekWorkoutStats = useMemo(() => {
  const monday = getMonday(new Date());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = dateKeyFor(d);
    const dayWorkouts = data.workouts.filter((w) => dateKeyFor(new Date(w.startTime)) === key);
    days.push({ date: d, key, count: dayWorkouts.length });
  }

  const weekEnd = new Date(monday);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekWorkouts = data.workouts.filter((w) => {
    const wd = new Date(w.startTime);
    return wd >= monday && wd < weekEnd;
  });

  const totalCalories = weekWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalDistance = weekWorkouts.reduce((sum, w) => sum + (w.distanceKm || 0), 0);

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const key = dateKeyFor(cursor);
    const has = data.workouts.some((w) => dateKeyFor(new Date(w.startTime)) === key);
    if (!has) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { days, count: weekWorkouts.length, totalCalories, totalDistance, streak };
}, [data.workouts]);

const lastThreeWorkouts = useMemo(
  () => [...data.workouts].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 3),
  [data.workouts]
);

const RU_MONTHS_SHORT = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const overallStats = useMemo(() => {
  const workouts = data.workouts;

  const totalCount = workouts.length;
  const totalDistance = workouts.reduce((sum, w) => sum + (w.distanceKm || 0), 0);
  const totalDurationMin = workouts.reduce((sum, w) => sum + (w.durationMin || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const byMonth = months.map(({ year, month }) => {
    const inMonth = workouts.filter((w) => {
      const wd = new Date(w.startTime);
      return wd.getFullYear() === year && wd.getMonth() === month;
    });
    return {
      label: RU_MONTHS_SHORT[month],
      count: inMonth.length,
      distance: inMonth.reduce((sum, w) => sum + (w.distanceKm || 0), 0),
      calories: inMonth.reduce((sum, w) => sum + (w.calories || 0), 0),
    };
  });

  const byType = {};
  for (const w of workouts) {
    byType[w.type] = (byType[w.type] || 0) + 1;
  }
  const byTypeArr = Object.entries(byType)
    .map(([type, count]) => ({ type, count, pct: totalCount > 0 ? (count / totalCount) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);

  return { totalCount, totalDistance, totalDurationMin, totalCalories, byMonth, byTypeArr };
}, [data.workouts]);

const openNewWorkoutModal = () => {
  setEditingWorkout({
    id: null,
    type: "run",
    title: "",
    startTime: new Date().toISOString(),
    durationMin: 30,
    distanceKm: null,
    calories: null,
    heartRate: null,
    feeling: 5,
    exercises: [],
    note: "",
    tags: [],
  });
  setSportView("editor");
};

const openEditWorkoutModal = (workout) => {
  setEditingWorkout({ ...workout, exercises: workout.exercises ? [...workout.exercises] : [] });
  setSportView("editor");
};

const formatWorkoutDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

const renderSport = () => {
  const RU_WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const maxDayCount = Math.max(1, ...weekWorkoutStats.days.map((d) => d.count));

  if (sportView === "dashboard") {
    return (
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>
              {weekWorkoutStats.count}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Тренировок за неделю</div>
          </div>
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>
              {weekWorkoutStats.streak}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Дней подряд</div>
          </div>
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>
              {Math.round(weekWorkoutStats.totalCalories)}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Ккал за неделю</div>
          </div>
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>
              {weekWorkoutStats.totalDistance.toFixed(1)}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Км за неделю</div>
          </div>
        </div>

        <div style={{ ...s.card, cursor: "default", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 Активность за неделю</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
            {weekWorkoutStats.days.map((day, i) => {
              const isToday = day.key === todayKey();
              const hasWorkout = day.count > 0;
              const barHeight = hasWorkout ? Math.max(18, (day.count / maxDayCount) * 70) : 6;

              return (
                <div
                  key={day.key}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
                  onClick={() => {
                    setSportFilterPeriod("all");
                    setSportSearch("");
                    setSportView("journal");
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 24,
                      height: barHeight,
                      borderRadius: 6,
                      background: hasWorkout ? t.accent : t.border,
                      transition: "height 0.3s",
                    }}
                    title={`${day.count} тренировок`}
                  />
                  <div style={{ fontSize: 10, color: isToday ? t.accent : t.textMuted, fontWeight: isToday ? 700 : 500 }}>
                    {RU_WEEKDAYS_SHORT[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Последние тренировки</div>

          {lastThreeWorkouts.length === 0 ? (
            <div style={{ ...s.empty, padding: "24px 12px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💪</div>
              <div style={{ fontSize: 13 }}>Тренировок пока нет</div>
            </div>
          ) : (
            lastThreeWorkouts.map((w) => {
              const meta = WORKOUT_TYPES[w.type] || WORKOUT_TYPES.run;
              return (
                <div
                  key={w.id}
                  style={s.card}
                  onClick={() => {
                    setActiveWorkoutId(w.id);
                    setSportView("detail");
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 22 }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{w.title || meta.label}</div>
                      <div style={{ fontSize: 12, color: t.textMuted }}>
                        {formatWorkoutDate(w.startTime)} · {w.durationMin} мин
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={s.btn("primary")} onClick={openNewWorkoutModal}>
            <Icon d={icons.plus} size={16} color="#fff" /> Новая тренировка
          </button>
          <button style={s.btn("secondary")} onClick={() => setSportView("journal")}>
            Журнал тренировок
          </button>
          {data.workouts.length > 0 && (
            <button style={s.btn("secondary")} onClick={() => setSportView("stats")}>
              📈 Статистика
            </button>
          )}
          {data.workoutTemplates.length > 0 && (
            <button style={s.btn("secondary")} onClick={() => setSportView("templates")}>
              Шаблоны
            </button>
          )}
        </div>
      </div>
    );
  }

  if (sportView === "journal") {
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button style={s.btn("ghost")} onClick={() => setSportView("dashboard")}>
            <Icon d={icons.back} size={16} color={t.text} /> Дашборд
          </button>
        </div>

        <input
          style={{ ...s.input, marginBottom: 12 }}
          placeholder="Поиск по названию, заметкам, тегам..."
          value={sportSearch}
          onChange={(e) => setSportSearch(e.target.value)}
        />

        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10, paddingBottom: 4 }}>
          {[{ id: "all", label: "Все" }, ...Object.entries(WORKOUT_TYPES).map(([id, m]) => ({ id, label: m.label }))].map(
            (opt) => (
              <button
                key={opt.id}
                onClick={() => setSportFilterType(opt.id)}
                style={{
                  ...s.categoryBadge(sportFilterType === opt.id ? t.accent : t.textMuted),
                  border: `1.5px solid ${sportFilterType === opt.id ? t.accent : t.border}`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {opt.label}
              </button>
            )
          )}
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
          {[
            { id: "all", label: "За всё время" },
            { id: "today", label: "Сегодня" },
            { id: "week", label: "За неделю" },
            { id: "month", label: "За месяц" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSportFilterPeriod(opt.id)}
              style={{
                ...s.categoryBadge(sportFilterPeriod === opt.id ? t.accent2 : t.textMuted),
                border: `1.5px solid ${sportFilterPeriod === opt.id ? t.accent2 : t.border}`,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {filteredWorkouts.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Ничего не найдено</div>
            <div style={{ fontSize: 13 }}>Попробуйте изменить фильтры или добавьте новую тренировку.</div>
          </div>
        ) : (
          filteredWorkouts.map((w) => {
            const meta = WORKOUT_TYPES[w.type] || WORKOUT_TYPES.run;
            return (
              <div
                key={w.id}
                style={s.card}
                onClick={() => {
                  setActiveWorkoutId(w.id);
                  setSportView("detail");
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>{meta.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{w.title || meta.label}</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
                      {formatWorkoutDate(w.startTime)} · {w.durationMin} мин
                      {w.distanceKm ? ` · ${w.distanceKm} км` : ""}
                      {w.calories ? ` · ${w.calories} ккал` : ""}
                    </div>
                    {w.tags && w.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {w.tags.map((tag) => (
                          <span key={tag} style={{ ...s.categoryBadge(t.accent2), cursor: "default" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  if (sportView === "detail") {
    const w = data.workouts.find((wk) => wk.id === activeWorkoutId);
    if (!w) {
      setSportView("journal");
      return null;
    }
    const meta = WORKOUT_TYPES[w.type] || WORKOUT_TYPES.run;

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button style={s.btn("ghost")} onClick={() => setSportView("journal")}>
            <Icon d={icons.back} size={16} color={t.text} /> Журнал
          </button>
        </div>

        <div style={{ ...s.card, cursor: "default" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 32 }}>{meta.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{w.title || meta.label}</div>
              <div style={{ fontSize: 12.5, color: t.textMuted }}>
                {new Date(w.startTime).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div>
              <div style={s.label}>Длительность</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{w.durationMin} мин</div>
            </div>
            {w.distanceKm ? (
              <div>
                <div style={s.label}>Дистанция</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{w.distanceKm} км</div>
              </div>
            ) : null}
            {w.calories ? (
              <div>
                <div style={s.label}>Калории</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{w.calories} ккал</div>
              </div>
            ) : null}
            {w.heartRate ? (
              <div>
                <div style={s.label}>Пульс</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{w.heartRate} уд/мин</div>
              </div>
            ) : null}
            <div>
              <div style={s.label}>Самочувствие</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{w.feeling}/10</div>
            </div>
          </div>

          {w.exercises && w.exercises.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={s.label}>Упражнения</div>
              {w.exercises.map((ex) => (
                <div
                  key={ex.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: `1px solid ${t.border}`,
                    fontSize: 13.5,
                  }}
                >
                  <span>{ex.name}</span>
                  <span style={{ color: t.textMuted }}>
                    {ex.sets}×{ex.reps} {ex.weight ? `· ${ex.weight} кг` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {w.note && (
            <div style={{ marginBottom: 16 }}>
              <div style={s.label}>Заметки</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{w.note}</div>
            </div>
          )}

          {w.tags && w.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {w.tags.map((tag) => (
                <span key={tag} style={{ ...s.categoryBadge(t.accent2), cursor: "default" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...s.btn("secondary"), flex: 1 }} onClick={() => openEditWorkoutModal(w)}>
              Редактировать
            </button>
            <button style={{ ...s.btn("secondary"), flex: 1 }} onClick={() => duplicateWorkout(w.id)}>
              Дублировать
            </button>
            <button style={s.btn("danger")} onClick={() => setShowWorkoutDeleteConfirm(w.id)}>
              <Icon d={icons.trash} size={15} color={t.danger} />
            </button>
          </div>
        </div>

        {showWorkoutDeleteConfirm && (
          <div style={s.modal} onClick={() => setShowWorkoutDeleteConfirm(null)}>
            <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={{ ...s.cardTitle, marginBottom: 12 }}>Удалить тренировку?</div>
              <div style={{ fontSize: 13.5, color: t.textMuted, marginBottom: 20 }}>
                Тренировку можно будет восстановить через уведомление сразу после удаления.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...s.btn("secondary"), flex: 1 }} onClick={() => setShowWorkoutDeleteConfirm(null)}>
                  Отмена
                </button>
                <button style={{ ...s.btn("danger"), flex: 1 }} onClick={() => deleteWorkout(showWorkoutDeleteConfirm)}>
                  Удалить
                </button>
              </div>
            </div>
            )}
          </div>
        );
        }
          if (sportView === "stats") {
    const maxMonthCount = Math.max(1, ...overallStats.byMonth.map((m) => m.count));
    const maxMonthDistance = Math.max(0.1, ...overallStats.byMonth.map((m) => m.distance));
    const maxMonthCalories = Math.max(1, ...overallStats.byMonth.map((m) => m.calories));
    const typeColors = ["#C4622D", "#2D6A4F", "#9C6B30", "#9C3848", "#6B5B95", "#3B7A9C"];

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button style={s.btn("ghost")} onClick={() => setSportView("dashboard")}>
            <Icon d={icons.back} size={16} color={t.text} /> Дашборд
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>{overallStats.totalCount}</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Всего тренировок</div>
          </div>
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>
              {overallStats.totalDistance.toFixed(1)}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Всего км</div>
          </div>
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>
              {Math.round(overallStats.totalDurationMin / 60)}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Часов тренировок</div>
          </div>
          <div style={{ ...s.card, cursor: "default", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>
              {Math.round(overallStats.totalCalories)}
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Всего ккал</div>
          </div>
        </div>

        {overallStats.totalCount === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Пока нет данных</div>
            <div style={{ fontSize: 13 }}>Добавьте тренировки, чтобы увидеть графики.</div>
          </div>
        ) : (
          <>
            <div style={{ ...s.card, cursor: "default", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 Тренировок по месяцам</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                {overallStats.byMonth.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 28,
                        height: m.count > 0 ? Math.max(10, (m.count / maxMonthCount) * 70) : 4,
                        borderRadius: 6,
                        background: m.count > 0 ? t.accent : t.border,
                      }}
                      title={`${m.count} тренировок`}
                    />
                    <div style={{ fontSize: 10, color: t.textMuted }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {overallStats.byTypeArr.length > 0 && (
              <div style={{ ...s.card, cursor: "default", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🥧 Распределение по типам</div>

                <div style={{ display: "flex", width: "100%", height: 14, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                  {overallStats.byTypeArr.map((item, i) => (
                    <div
                      key={item.type}
                      style={{
                        width: `${item.pct}%`,
                        background: typeColors[i % typeColors.length],
                      }}
                      title={`${WORKOUT_TYPES[item.type]?.label || item.type}: ${item.count}`}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {overallStats.byTypeArr.map((item, i) => (
                    <div key={item.type} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: typeColors[i % typeColors.length],
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1 }}>
                        {WORKOUT_TYPES[item.type]?.icon} {WORKOUT_TYPES[item.type]?.label || item.type}
                      </span>
                      <span style={{ color: t.textMuted }}>
                        {item.count} · {item.pct.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ ...s.card, cursor: "default", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🏁 Дистанция по месяцам (км)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                {overallStats.byMonth.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 28,
                        height: m.distance > 0 ? Math.max(10, (m.distance / maxMonthDistance) * 70) : 4,
                        borderRadius: 6,
                        background: m.distance > 0 ? t.accent2 : t.border,
                      }}
                      title={`${m.distance.toFixed(1)} км`}
                    />
                    <div style={{ fontSize: 10, color: t.textMuted }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...s.card, cursor: "default", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🔥 Калории по месяцам</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                {overallStats.byMonth.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 28,
                        height: m.calories > 0 ? Math.max(10, (m.calories / maxMonthCalories) * 70) : 4,
                        borderRadius: 6,
                        background: m.calories > 0 ? t.warning : t.border,
                      }}
                      title={`${Math.round(m.calories)} ккал`}
                    />
                    <div style={{ fontSize: 10, color: t.textMuted }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (sportView === "templates") {
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button style={s.btn("ghost")} onClick={() => setSportView("dashboard")}>
            <Icon d={icons.back} size={16} color={t.text} /> Дашборд
          </button>
        </div>

        {data.workoutTemplates.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Шаблонов пока нет</div>
            <div style={{ fontSize: 13 }}>
              Сохраните тренировку как шаблон в её карточке редактирования, чтобы быстро запускать её снова.
            </div>
          </div>
        ) : (
          data.workoutTemplates.map((tpl) => {
            const meta = WORKOUT_TYPES[tpl.type] || WORKOUT_TYPES.run;
            return (
              <div key={tpl.id} style={{ ...s.card, cursor: "default" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 22 }}>{meta.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{tpl.title}</div>
                    <div style={{ fontSize: 12, color: t.textMuted }}>
                      {meta.label} · {tpl.durationMin || 30} мин
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={{ ...s.btn("primary"), flex: 1 }}
                    onClick={() => createWorkoutFromTemplate(tpl)}
                  >
                    Старт
                  </button>
                  <button style={s.btn("danger")} onClick={() => deleteWorkoutTemplate(tpl.id)}>
                    <Icon d={icons.trash} size={15} color={t.danger} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  if (sportView === "editor" && editingWorkout) {
    const w = editingWorkout;
    const isDistanceType = DISTANCE_TYPES.has(w.type);

    const updateExercise = (exId, patch) => {
      setEditingWorkout({
        ...w,
        exercises: w.exercises.map((ex) => (ex.id === exId ? { ...ex, ...patch } : ex)),
      });
    };
    const addExercise = () => {
      setEditingWorkout({
        ...w,
        exercises: [...w.exercises, { id: makeId("ex"), name: "", sets: 3, reps: 10, weight: null }],
      });
    };
    const removeExercise = (exId) => {
      setEditingWorkout({ ...w, exercises: w.exercises.filter((ex) => ex.id !== exId) });
    };

    const localDateTimeValue = w.startTime
      ? new Date(new Date(w.startTime).getTime() - new Date(w.startTime).getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "";

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            style={s.btn("ghost")}
            onClick={() => {
              setEditingWorkout(null);
              setSportView(w.id ? "detail" : "dashboard");
            }}
          >
            <Icon d={icons.back} size={16} color={t.text} /> Отмена
          </button>
        </div>

        <div style={s.section}>
          <label style={s.label}>Тип тренировки *</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(WORKOUT_TYPES).map(([id, meta]) => (
              <button
                key={id}
                onClick={() => setEditingWorkout({ ...w, type: id })}
                style={{
                  ...s.categoryBadge(w.type === id ? t.accent : t.textMuted),
                  border: `1.5px solid ${w.type === id ? t.accent : t.border}`,
                }}
              >
                {meta.icon} {meta.label}
              </button>
            ))}
          </div>
        </div>

        <div style={s.section}>
          <label style={s.label}>Название</label>
          <input
            style={s.input}
            placeholder={WORKOUT_TYPES[w.type]?.label || "Тренировка"}
            value={w.title}
            onChange={(e) => setEditingWorkout({ ...w, title: e.target.value })}
          />
        </div>

        <div style={s.section}>
          <label style={s.label}>Дата и время начала *</label>
          <input
            type="datetime-local"
            style={s.input}
            value={localDateTimeValue}
            onChange={(e) =>
              setEditingWorkout({
                ...w,
                startTime: e.target.value ? new Date(e.target.value).toISOString() : w.startTime,
              })
            }
          />
        </div>

        <div style={s.section}>
          <label style={s.label}>Длительность (мин)</label>
          <input
            type="number"
            min={1}
            style={s.input}
            value={w.durationMin}
            onChange={(e) => setEditingWorkout({ ...w, durationMin: Math.max(1, parseInt(e.target.value, 10) || 1) })}
          />
        </div>

        {isDistanceType && (
          <div style={s.section}>
            <label style={s.label}>Дистанция (км)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              style={s.input}
              value={w.distanceKm ?? ""}
              onChange={(e) => setEditingWorkout({ ...w, distanceKm: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>
        )}

        <div style={s.section}>
          <label style={s.label}>Калории</label>
          <input
            type="number"
            min={0}
            style={s.input}
            placeholder="Например: 350"
            value={w.calories ?? ""}
            onChange={(e) => setEditingWorkout({ ...w, calories: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
        </div>

        <div style={s.section}>
          <label style={s.label}>Пульс (опционально)</label>
          <input
            type="number"
            min={0}
            style={s.input}
            placeholder="Например: 140"
            value={w.heartRate ?? ""}
            onChange={(e) => setEditingWorkout({ ...w, heartRate: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
        </div>

        <div style={s.section}>
          <label style={s.label}>Самочувствие: {w.feeling}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={w.feeling}
            onChange={(e) => setEditingWorkout({ ...w, feeling: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </div>

        {w.type === "strength" && (
          <div style={s.section}>
            <label style={s.label}>Упражнения</label>
            {w.exercises.map((ex) => (
              <div key={ex.id} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                <input
                  style={{ ...s.input, flex: 2 }}
                  placeholder="Название"
                  value={ex.name}
                  onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                />
                <input
                  type="number"
                  style={{ ...s.input, width: 50, padding: "8px" }}
                  placeholder="Подх."
                  value={ex.sets}
                  onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value, 10) || 0 })}
                />
                <input
                  type="number"
                  style={{ ...s.input, width: 50, padding: "8px" }}
                  placeholder="Повт."
                  value={ex.reps}
                  onChange={(e) => updateExercise(ex.id, { reps: parseInt(e.target.value, 10) || 0 })}
                />
                <input
                  type="number"
                  style={{ ...s.input, width: 55, padding: "8px" }}
                  placeholder="Кг"
                  value={ex.weight ?? ""}
                  onChange={(e) => updateExercise(ex.id, { weight: e.target.value ? parseFloat(e.target.value) : null })}
                />
                <button style={{ ...s.btn("ghost"), padding: 4 }} onClick={() => removeExercise(ex.id)}>
                  <Icon d={icons.trash} size={14} color={t.textMuted} />
                </button>
              </div>
            ))}
            <button style={{ ...s.btn("ghost"), justifyContent: "flex-start" }} onClick={addExercise}>
              <Icon d={icons.plus} size={14} color={t.textMuted} /> Добавить упражнение
            </button>
          </div>
        )}

        <div style={s.section}>
          <label style={s.label}>Заметки</label>
          <textarea
            style={s.textarea}
            placeholder="Как прошла тренировка..."
            value={w.note}
            onChange={(e) => setEditingWorkout({ ...w, note: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            style={{ ...s.btn("secondary"), flex: 1 }}
            onClick={() => {
              const title = w.title.trim() || WORKOUT_TYPES[w.type]?.label || "Тренировка";
              saveWorkoutTemplate({
                id: makeId("wtpl"),
                type: w.type,
                title,
                durationMin: w.durationMin,
                exercises: w.exercises,
                tags: w.tags,
              });
              showNotification("⭐ Сохранено как шаблон");
            }}
          >
            Сохранить как шаблон
          </button>
          <button
            style={{ ...s.btn("primary"), flex: 1 }}
            onClick={() =>
              saveWorkout({
                ...w,
                id: w.id || makeId("wrk"),
                title: w.title.trim() || WORKOUT_TYPES[w.type]?.label || "Тренировка",
              })
            }
          >
            Сохранить
          </button>
        </div>
      </div>
    );
  }
        return null;
};
        
// --- Календарь: помощники ---
const RU_WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const RU_MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const EVENT_COLORS = ["#C4622D", "#2D6A4F", "#9C6B30", "#9C3848", "#6B5B95", "#3B7A9C"];
const EVENT_TYPE_META = {
  work: { label: "Работа", icon: "💼" },
  personal: { label: "Личное", icon: "🎯" },
  sport: { label: "Спорт", icon: "🏃" },
  other: { label: "Другое", icon: "📌" },
};
const REPEAT_OPTIONS = [
  { id: "none", label: "Нет" },
  { id: "daily", label: "Ежедневно" },
  { id: "weekly", label: "Еженедельно" },
  { id: "monthly", label: "Ежемесячно" },
];
const REMINDER_OPTIONS = [
  { id: "none", label: "Без напоминания" },
  { id: "15", label: "За 15 мин" },
  { id: "30", label: "За 30 мин" },
  { id: "60", label: "За 1 час" },
  { id: "1440", label: "За 1 день" },
];

const buildMonthGrid = (monthDate) => {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - firstWeekday);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
};

const eventsByDateKey = useMemo(() => {
  const map = {};
  for (const ev of data.events) {
    if (!ev.startTime) continue;
    const key = dateKeyFor(new Date(ev.startTime));
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }
  return map;
}, [data.events]);

const monthGridDays = useMemo(() => buildMonthGrid(calendarMonth), [calendarMonth]);

const selectedDayEvents = eventsByDateKey[calendarSelectedDate] || [];
const selectedDateObj = useMemo(() => {
  const [y, m, d] = calendarSelectedDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}, [calendarSelectedDate]);

const formatEventTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const openNewEventModal = (presetDateKey) => {
  const base = presetDateKey || calendarSelectedDate;
  const [y, m, d] = base.split("-").map(Number);
  const startDefault = new Date(y, m - 1, d, 9, 0);

  setEditingEvent({
    id: null,
    title: "",
    startTime: startDefault.toISOString(),
    endTime: null,
    type: "personal",
    location: "",
    repeat: "none",
    reminder: "none",
    color: EVENT_COLORS[0],
    note: "",
    done: false,
  });
  setEventModalOpen(true);
};

const openEditEventModal = (event) => {
  setEditingEvent({ ...event });
  setEventModalOpen(true);
};

const renderCalendar = () => {
  const monthLabel = `${RU_MONTHS[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`;
  const todayK = todayKey();

  const goToMonth = (delta) => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() + delta);
    setCalendarMonth(next);
  };

  const goToToday = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    setCalendarMonth(d);
    setCalendarSelectedDate(todayKey());
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button style={s.btn("ghost")} onClick={() => goToMonth(-1)} title="Предыдущий месяц">
          <Icon d={icons.back} size={18} color={t.text} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{monthLabel}</div>
          <button
            style={{
              ...s.btn("secondary"),
              padding: "4px 10px",
              fontSize: 12,
            }}
            onClick={goToToday}
          >
            Сегодня
          </button>
        </div>

        <button
          style={s.btn("ghost")}
          onClick={() => goToMonth(1)}
          title="Следующий месяц"
        >
          <Icon d={icons.back} size={18} color={t.text} style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            marginBottom: 6,
          }}
        >
          {RU_WEEKDAYS.map((wd) => (
            <div
              key={wd}
              style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color: t.textMuted,
                padding: "4px 0",
              }}
            >
              {wd}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
          }}
        >
          {monthGridDays.map((d, idx) => {
            const key = dateKeyFor(d);
            const inMonth = d.getMonth() === calendarMonth.getMonth();
            const isToday = key === todayK;
            const isSelected = key === calendarSelectedDate;
            const dayEvents = eventsByDateKey[key] || [];
            const hasSport = dayEvents.some((e) => e.type === "sport");
            const hasNote = !!(data.dailyLogs?.[key]?.note);
            const dayLog = data.dailyLogs?.[key];
            const allTasksDone =
              dayLog && dayLog.tasks && dayLog.tasks.length > 0 && dayLog.tasks.every((tk) => tk.done);

            const firstEvent = dayEvents[0];
            const extraCount = dayEvents.length > 1 ? dayEvents.length - 1 : 0;

            return (
              <button
                key={idx}
                onClick={() => setCalendarSelectedDate(key)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 10,
                  border: isSelected
                    ? `2px solid ${t.accent}`
                    : isToday
                    ? `1.5px solid ${t.accent}88`
                    : `1px solid ${t.border}`,
                  background: isSelected ? `${t.accent}14` : t.card,
                  color: inMonth ? t.text : t.textMuted,
                  opacity: inMonth ? 1 : 0.45,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                  padding: "4px 2px",
                  fontFamily: "inherit",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: isToday ? 700 : 500 }}>{d.getDate()}</div>

                {firstEvent && (
                  <div
                    title={dayEvents.map((e) => e.title).join(", ")}
                    style={{
                      fontSize: 8.5,
                      lineHeight: 1.2,
                      padding: "1px 5px",
                      borderRadius: 20,
                      border: `1.3px solid ${firstEvent.color || t.accent}`,
                      color: t.text,
                      maxWidth: "100%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      boxSizing: "border-box",
                    }}
                  >
                    {firstEvent.title}
                    {extraCount > 0 ? ` +${extraCount}` : ""}
                  </div>
                )}

                <div style={{ display: "flex", gap: 1, fontSize: 8, position: "absolute", bottom: 2, right: 3 }}>
                  {hasSport && <span>🏃</span>}
                  {hasNote && <span>📝</span>}
                  {allTasksDone && <span>✅</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button style={s.btn("primary")} onClick={() => openNewEventModal()}>
          <Icon d={icons.plus} size={16} color="#fff" /> Событие
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
          {selectedDateObj.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" })}
        </div>

        {selectedDayEvents.length === 0 ? (
          <div style={{ ...s.empty, padding: "24px 12px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 13 }}>На этот день событий нет</div>
          </div>
        ) : (
          selectedDayEvents.map((ev) => {
            const meta = EVENT_TYPE_META[ev.type] || EVENT_TYPE_META.other;
            return (
              <div
                key={ev.id}
                style={{ ...s.card, marginBottom: 10, borderLeft: `4px solid ${ev.color || t.accent}` }}
                onClick={() => openEditEventModal(ev)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ fontSize: 20 }}>{meta.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14.5,
                        textDecoration: ev.done ? "line-through" : "none",
                        color: ev.done ? t.textMuted : t.text,
                      }}
                    >
                      {ev.title}
                    </div>

                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
                      {ev.startTime ? formatEventTime(ev.startTime) : "Весь день"}
                      {ev.location ? ` · ${ev.location}` : ""}
                      {ev.repeat && ev.repeat !== "none"
                        ? ` · ${REPEAT_OPTIONS.find((r) => r.id === ev.repeat)?.label || ""}`
                        : ""}
                    </div>
                  </div>

                  <button
                    style={{
                      ...s.btn(ev.done ? "secondary" : "primary"),
                      padding: "6px 10px",
                      fontSize: 11,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEventDone(ev.id);
                    }}
                  >
                    {ev.done ? "Готово ✓" : "Выполнено"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    style={{ ...s.btn("secondary"), padding: "6px 10px", fontSize: 11 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditEventModal(ev);
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    style={{ ...s.btn("secondary"), padding: "6px 10px", fontSize: 11 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateEvent(ev.id);
                    }}
                  >
                    Дублировать
                  </button>
                  <button
                    style={{ ...s.btn("danger"), padding: "6px 10px", fontSize: 11 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEventDeleteConfirm(ev.id);
                    }}
                  >
                    <Icon d={icons.trash} size={13} color={t.danger} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {eventModalOpen && editingEvent && (
        <div
          style={s.modal}
          onClick={() => {
            setEventModalOpen(false);
            setEditingEvent(null);
          }}
        >
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.cardTitle, marginBottom: 16 }}>
              {editingEvent.id ? "Редактировать событие" : "Новое событие"}
            </div>

            <div style={s.section}>
              <label style={s.label}>Название *</label>
              <input
                style={s.input}
                placeholder="Например: Встреча с командой"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
              />
            </div>

            <div style={s.section}>
              <label style={s.label}>Дата и время начала</label>
              <input
                type="datetime-local"
                style={s.input}
                value={
                  editingEvent.startTime
                    ? new Date(
                        new Date(editingEvent.startTime).getTime() -
                          new Date(editingEvent.startTime).getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    startTime: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
              />
            </div>

            <div style={s.section}>
              <label style={s.label}>Дата и время окончания (необязательно)</label>
              <input
                type="datetime-local"
                style={s.input}
                value={
                  editingEvent.endTime
                    ? new Date(
                        new Date(editingEvent.endTime).getTime() -
                          new Date(editingEvent.endTime).getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    endTime: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
              />
            </div>

            <div style={s.section}>
              <label style={s.label}>Тип события</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(EVENT_TYPE_META).map(([id, meta]) => (
                  <button
                    key={id}
                    onClick={() => setEditingEvent({ ...editingEvent, type: id })}
                    style={{
                      ...s.categoryBadge(editingEvent.type === id ? t.accent : t.textMuted),
                      border: `1.5px solid ${editingEvent.type === id ? t.accent : t.border}`,
                    }}
                  >
                    {meta.icon} {meta.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.section}>
              <label style={s.label}>Местоположение</label>
              <input
                style={s.input}
                placeholder="Например: Офис, каб. 305"
                value={editingEvent.location}
                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
              />
            </div>

            <div style={s.section}>
              <label style={s.label}>Повторение</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {REPEAT_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setEditingEvent({ ...editingEvent, repeat: r.id })}
                    style={{
                      ...s.categoryBadge(editingEvent.repeat === r.id ? t.accent : t.textMuted),
                      border: `1.5px solid ${editingEvent.repeat === r.id ? t.accent : t.border}`,
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.section}>
              <label style={s.label}>Напоминание</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {REMINDER_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setEditingEvent({ ...editingEvent, reminder: r.id })}
                    style={{
                      ...s.categoryBadge(editingEvent.reminder === r.id ? t.accent : t.textMuted),
                      border: `1.5px solid ${editingEvent.reminder === r.id ? t.accent : t.border}`,
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.section}>
              <label style={s.label}>Цвет</label>
              <div style={{ display: "flex", gap: 8 }}>
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setEditingEvent({ ...editingEvent, color: c })}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border: editingEvent.color === c ? `3px solid ${t.text}` : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={s.section}>
              <label style={s.label}>Заметка</label>
              <textarea
                style={s.textarea}
                placeholder="Дополнительные детали..."
                value={editingEvent.note}
                onChange={(e) => setEditingEvent({ ...editingEvent, note: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                style={{ ...s.btn("secondary"), flex: 1 }}
                onClick={() => {
                  setEventModalOpen(false);
                  setEditingEvent(null);
                }}
              >
                Отмена
              </button>
              <button
                style={{ ...s.btn("primary"), flex: 1 }}
                disabled={!editingEvent.title.trim()}
                onClick={() =>
                  saveEvent({
                    ...editingEvent,
                    id: editingEvent.id || makeId("evt"),
                  })
                }
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showEventDeleteConfirm && (
        <div style={s.modal} onClick={() => setShowEventDeleteConfirm(null)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.cardTitle, marginBottom: 12 }}>Удалить событие?</div>
            <div style={{ fontSize: 13.5, color: t.textMuted, marginBottom: 20 }}>
              Событие можно будет восстановить через уведомление сразу после удаления.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{ ...s.btn("secondary"), flex: 1 }}
                onClick={() => setShowEventDeleteConfirm(null)}
              >
                Отмена
              </button>
              <button
                style={{ ...s.btn("danger"), flex: 1 }}
                onClick={() => deleteEvent(showEventDeleteConfirm)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// --- Вкладки, заголовок, основной возврат ---
const tabs = [
  { id: "notes", label: "Заметки", icon: icons.note },
  { id: "sport", label: "Спорт", icon: icons.sport },
  { id: "calendar", label: "Календарь", icon: icons.calendar },
  { id: "ai", label: "ИИ", icon: icons.ai },
  { id: "library", label: "Библиотека", icon: icons.library },
  { id: "quiz", label: "Чек-листы", icon: icons.quiz },
  { id: "tests", label: "Тесты", icon: icons.edit },
];

const getTabLabel = (id) => {
  if (id === "notes") return "Заметки";
  if (id === "sport") return "Спорт";
  if (id === "calendar") return "Календарь";
  if (id === "ai") return "ИИ";
  if (id === "library") return "Библиотека";
  if (id === "tests") return "Тесты";
  return "Чек-листы";
};

const headerTitle =
  tab === "notes"
    ? "📝 SmartNotes"
    : tab === "sport"
    ? "🏃 Спорт"
    : tab === "calendar"
    ? "📅 Календарь"
    : tab === "ai"
    ? "🤖 ИИ"
    : tab === "library"
    ? "📚 Библиотека"
    : tab === "tests"
    ? "🧪 Тесты"
    : "✅ Чек-листы";

return (
  <div style={s.app}>
    <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
        background: ${t.bg};
        color: ${t.text};
      }
      input, textarea { -webkit-user-select: text; user-select: text; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideInFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes slideInFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: ${t.surface}; }
      ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: ${t.textMuted}; }
      @media (orientation: landscape) { body { overflow: hidden; } }
      @media (max-width: 768px) {
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }
    `}</style>

    <div style={s.header}>
      {((view !== "list" && tab === "notes") ||
        (tab === "quiz" && checklistView !== "list") ||
        (tab === "tests" && quizView !== "list") ||
        (tab === "sport" && sportView !== "dashboard") ||
        (tab !== "notes" && tab !== "quiz" && tab !== "tests" && tab !== "sport")) && (
        <button
          style={s.btn("ghost")}
          onClick={() => {
            if (tab === "quiz" && checklistView !== "list") {
              if (checklistView === "editor" && activeChecklistId) {
                setChecklistView("detail");
              } else {
                setChecklistView("list");
                setActiveChecklistId(null);
              }
              setEditingChecklist(null);
              return;
            }
            if (tab === "tests" && quizView !== "list") {
              if (quizView === "results") {
                setLastQuizResult(null);
                setQuizView("detail");
              } else if (quizView === "play") {
                setQuizView("detail");
              } else if (quizView === "editor" && activeQuizId) {
                setQuizView("detail");
              } else {
                setQuizView("list");
                setActiveQuizId(null);
              }
              setEditingQuiz(null);
              return;
            }
            if (tab === "sport" && sportView !== "dashboard") {
              if (sportView === "editor") {
                setEditingWorkout(null);
                setSportView(activeWorkoutId ? "detail" : "dashboard");
              } else if (sportView === "detail") {
                setSportView("journal");
                setActiveWorkoutId(null);
              } else {
                setSportView("dashboard");
              }
              return;
            }
            setView("list");
            setTab("notes");
          }}
        >
          <Icon d={icons.back} size={18} color={t.text} />
        </button>
      )}

      {tab === "notes" && view === "list" && (
        <button
          style={s.btn("ghost")}
          onClick={() => setSidePanelOpen(true)}
          title="Меню"
        >
          <Icon d={icons.menu} size={18} color={t.text} />
        </button>
      )}

      <div style={s.headerTitle}>{headerTitle}</div>

      <button
        style={s.btn("ghost")}
        onClick={toggleTheme}
        title="Переключить тему"
      >
        <Icon d={theme === "dark" ? icons.sun : icons.moon} size={18} color={t.text} />
      </button>
    </div>

    <div style={s.content}>
      {tab === "notes" && renderNotes()}
      {tab === "sport" && renderSport()}
      {tab === "calendar" && renderCalendar()}
      {tab === "ai" && renderAI()}
      {tab === "library" && renderLibrary()}
      {tab === "quiz" && renderChecklists()}
      {tab === "tests" && renderTests()}
    </div>

    {(view === "list" || tab !== "notes") && (
      <div style={s.bottomNav} onClick={() => navEditingTabId && setNavEditingTabId(null)}>
        {tabs
          .filter((tItem) => !isTabHidden(tItem.id))
          .map((tItem) => (
            <button
              key={tItem.id}
              style={{ ...s.navButton(tab === tItem.id), position: "relative", overflow: "visible" }}
              onMouseDown={() => startNavLongPress(tItem.id)}
              onMouseUp={cancelNavLongPress}
              onMouseLeave={cancelNavLongPress}
              onTouchStart={() => startNavLongPress(tItem.id)}
              onTouchEnd={cancelNavLongPress}
              onClick={(e) => {
                if (navLongPressFiredRef.current) {
                  navLongPressFiredRef.current = false;
                  return;
                }
                if (navEditingTabId) {
                  e.stopPropagation();
                  setNavEditingTabId(null);
                  return;
                }

                setTab(tItem.id);

                if (tItem.id === "notes") setView("list");
                if (tItem.id === "sport") setSportView("dashboard");
              }}
            >
              {navEditingTabId === tItem.id && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    hideTab(tItem.id);
                  }}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: "50%",
                    transform: "translateX(50%)",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: t.danger,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1,
                    boxShadow: `0 2px 6px rgba(${t.shadow}, 0.35)`,
                    zIndex: 1,
                  }}
                >
                  −
                </div>
              )}

              <div style={s.navIcon}>
                <Icon
                  d={tItem.icon}
                  size={isMobile ? 20 : 24}
                  color={tab === tItem.id ? t.accent : t.textMuted}
                />
              </div>

              <div style={s.navLabel}>{getTabLabel(tItem.id)}</div>
            </button>
          ))}
      </div>
    )}
        {/* Модалка создания категории */}
    {showCategoryModal && (
      <div style={s.modal} onClick={() => setShowCategoryModal(false)}>
        <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ ...s.cardTitle, marginBottom: 16 }}>
            <Icon d={icons.folder} size={16} color={t.text} style={{ marginRight: 6 }} /> Новая категория
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
              {["#C4622D", "#2D6A4F", "#9C6B30", "#9C3848", "#6B5B95", "#B8763F"].map(
                (color) => (
                  <button
                    key={color}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: color,
                      border:
                        newCategoryColor === color
                          ? `3px solid ${t.text}`
                          : `2px solid ${t.border}`,
                      cursor: "pointer",
                    }}
                    onClick={() => setNewCategoryColor(color)}
                  />
                )
              )}
            </div>
          </div>

          <div style={{ ...s.row, justifyContent: "flex-end", gap: 8 }}>
            <button style={s.btn("ghost")} onClick={() => setShowCategoryModal(false)}>
              Отмена
            </button>
            <button style={s.btn("primary")} onClick={addCategory}>
              <Icon d={icons.plus} size={16} color="#fff" /> Создать
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Модалка подтверждения удаления заметки */}
    {showDeleteConfirm && (
      <div style={s.modal} onClick={() => setShowDeleteConfirm(null)}>
        <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              ...s.cardTitle,
              marginBottom: 16,
              color: t.danger,
            }}
          >
            ⚠️ Подтвердите удаление
          </div>

          <div style={{ marginBottom: 20, fontSize: 14, color: t.text }}>
            Вы уверены, что хотите удалить заметку{" "}
            <strong>"{activeNote?.title || "Без названия"}"</strong>?
            <br />
            <span
              style={{
                color: t.textMuted,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Это действие нельзя отменить.
            </span>
          </div>

          <div style={{ ...s.row, justifyContent: "flex-end", gap: 8 }}>
            <button style={s.btn("ghost")} onClick={() => setShowDeleteConfirm(null)}>
              Отмена
            </button>
            <button
              style={s.btn("danger")}
              onClick={() => deleteNote(showDeleteConfirm)}
            >
              <Icon d={icons.trash} size={16} color={t.danger} /> Удалить
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Модалка подтверждения удаления чек-листа */}
    {showChecklistDeleteConfirm && (
      <div style={s.modal} onClick={() => setShowChecklistDeleteConfirm(null)}>
        <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              ...s.cardTitle,
              marginBottom: 16,
              color: t.danger,
            }}
          >
            ⚠️ Подтвердите удаление
          </div>

          <div style={{ marginBottom: 20, fontSize: 14, color: t.text }}>
            Вы уверены, что хотите удалить чек-лист{" "}
            <strong>
              "
              {data.checklists.find((c) => c.id === showChecklistDeleteConfirm)?.title ||
                "Без названия"}
              "
            </strong>
            ?
            <br />
            <span
              style={{
                color: t.textMuted,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Это действие нельзя отменить.
            </span>
          </div>

          <div style={{ ...s.row, justifyContent: "flex-end", gap: 8 }}>
            <button
              style={s.btn("ghost")}
              onClick={() => setShowChecklistDeleteConfirm(null)}
            >
              Отмена
            </button>
            <button
              style={s.btn("danger")}
              onClick={() => deleteChecklist(showChecklistDeleteConfirm)}
            >
              <Icon d={icons.trash} size={16} color={t.danger} /> Удалить
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Модалка перемещения заметок */}
    {showMoveModal && (
      <div style={s.modal} onClick={() => setShowMoveModal(false)}>
        <div style={{ ...s.modalContent, maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>
            Перенести в папку
          </div>

          <button
            onClick={() => bulkMoveNotes([...selectedIds], null)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px",
              borderRadius: 12,
              background: t.card,
              border: `1.5px solid ${t.border}`,
              cursor: "pointer",
              textAlign: "left",
              marginBottom: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.textMuted }} />
            <div style={{ fontSize: 14, color: t.text }}>Без папки</div>
          </button>

          {data.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => bulkMoveNotes([...selectedIds], cat.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px",
                borderRadius: 12,
                background: t.card,
                border: `1.5px solid ${t.border}`,
                cursor: "pointer",
                textAlign: "left",
                marginBottom: 8,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color }} />
              <div style={{ fontSize: 14, color: t.text }}>{cat.name}</div>
            </button>
          ))}

          <button
            style={{ ...s.btn("ghost"), width: "100%", justifyContent: "center", marginTop: 4 }}
            onClick={() => setShowMoveModal(false)}
          >
            Отмена
          </button>
        </div>
      </div>
    )}

    {/* Модалка подтверждения удаления теста */}
    {showQuizDeleteConfirm && (
      <div style={s.modal} onClick={() => setShowQuizDeleteConfirm(null)}>
        <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              ...s.cardTitle,
              marginBottom: 16,
              color: t.danger,
            }}
          >
            ⚠️ Подтвердите удаление
          </div>

          <div style={{ marginBottom: 20, fontSize: 14, color: t.text }}>
            Вы уверены, что хотите удалить тест{" "}
            <strong>
              "
              {data.quizzes.find((q) => q.id === showQuizDeleteConfirm)?.title ||
                "Без названия"}
              "
            </strong>
            ?
            <br />
            <span
              style={{
                color: t.textMuted,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Это действие нельзя отменить.
            </span>
          </div>

          <div style={{ ...s.row, justifyContent: "flex-end", gap: 8 }}>
            <button
              style={s.btn("ghost")}
              onClick={() => setShowQuizDeleteConfirm(null)}
            >
              Отмена
            </button>
            <button
              style={s.btn("danger")}
              onClick={() => deleteQuiz(showQuizDeleteConfirm)}
            >
              <Icon d={icons.trash} size={16} color={t.danger} /> Удалить
            </button>
          </div>
        </div>
      </div>
    )}

    <SaveIndicator />
    <UndoSnackbar />

    {/* Сайдбар (меню) */}
    {sidePanelOpen && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 2100,
          background: `rgba(${t.shadow}, 0.5)`,
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={() => setSidePanelOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "min(320px, 85%)",
            background: t.surface,
            borderRight: `1.5px solid ${t.border}`,
            boxShadow: `20px 0 40px rgba(${t.shadow}, 0.25)`,
            display: "flex",
            flexDirection: "column",
            animation: "slideInFromLeft 0.25s ease",
          }}
        >
          <div style={{ padding: "20px 18px 14px", borderBottom: `1px solid ${t.border}` }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: t.text }}>Меню</div>
              <button style={s.btn("ghost")} onClick={() => setSidePanelOpen(false)}>
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                background: t.card,
                borderRadius: 10,
                padding: 3,
                gap: 2,
              }}
            >
              <button
                onClick={() => setSideMenuMode("folders")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: sideMenuMode === "folders" ? t.surface : "transparent",
                  color: sideMenuMode === "folders" ? t.text : t.textMuted,
                  boxShadow: sideMenuMode === "folders" ? `0 1px 3px rgba(${t.shadow}, 0.15)` : "none",
                  transition: "all 0.15s",
                }}
              >
                📂 Папки
              </button>
              <button
                onClick={() => setSideMenuMode("widgets")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: sideMenuMode === "widgets" ? t.surface : "transparent",
                  color: sideMenuMode === "widgets" ? t.text : t.textMuted,
                  boxShadow: sideMenuMode === "widgets" ? `0 1px 3px rgba(${t.shadow}, 0.15)` : "none",
                  transition: "all 0.15s",
                }}
              >
                📌 Виджеты
              </button>
            </div>
          </div>

          {sideMenuMode === "folders" && (
            <div style={{ padding: "14px 18px 8px" }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <Icon d={icons.search} size={16} color={t.textMuted} />
                </div>
                <input
                  value={folderSearch}
                  onChange={(e) => setFolderSearch(e.target.value)}
                  placeholder="Поиск по папкам"
                  style={{ ...s.input, paddingLeft: 36 }}
                />
              </div>
            </div>
          )}

          {sideMenuMode === "folders" ? (
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
              <div
                style={{
                  ...s.label,
                  fontSize: 12,
                  padding: "6px 6px 8px",
                  color: t.textMuted,
                }}
              >
                ПАПКИ
              </div>
              {(() => {
                const q = folderSearch.trim().toLowerCase();
                const folders = data.categories.filter((cat) =>
                  q ? cat.name.toLowerCase().includes(q) : true
                );

                if (folders.length === 0) {
                  return (
                    <div
                      style={{
                        padding: "18px 6px",
                        fontSize: 13,
                        color: t.textMuted,
                        textAlign: "center",
                      }}
                    >
                      {q ? "Папки не найдены" : "Пока нет папок"}
                    </div>
                  );
                }

                return folders.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setTab("notes");
                      setView("list");
                      setSidePanelOpen(false);
                      setFolderSearch("");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 8px",
                      borderRadius: 10,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      marginBottom: 2,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 14,
                        color: t.text,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.name}
                    </div>
                    <Icon d={icons.chevronRight} size={16} color={t.textMuted} />
                  </button>
                ));
              })()}
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
              <div
                style={{
                  ...s.label,
                  fontSize: 12,
                  padding: "6px 6px 8px",
                  color: t.textMuted,
                }}
              >
                ДОСТУПНЫЕ ВИДЖЕТЫ
              </div>
              {[
                { id: "sport", label: "Спорт", icon: "🏃", desc: "Тренировки за неделю и серия" },
                { id: "calendar", label: "Календарь", icon: "📅", desc: "Сегодняшние события" },
              ].map((widget) => {
                const active = isWidgetActive(widget.id);
                return (
                  <div
                    key={widget.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 8px",
                      borderRadius: 10,
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{widget.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{widget.label}</div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: t.textMuted,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {widget.desc}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      style={{
                        ...s.btn(active ? "secondary" : "primary"),
                        padding: "6px 12px",
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {active ? "Добавлено ✓" : "Добавить"}
                    </button>
                  </div>
                );
              })}

              <div
                style={{
                  ...s.label,
                  fontSize: 12,
                  padding: "18px 6px 8px",
                  color: t.textMuted,
                }}
              >
                ВКЛАДКИ НИЖНЕЙ ПАНЕЛИ
              </div>
              <div style={{ fontSize: 11.5, color: t.textMuted, padding: "0 6px 10px" }}>
                Скройте лишние вкладки, чтобы приложение было удобнее под вас. Минимум {MIN_VISIBLE_TABS}{" "}
                вкладки останутся видимыми.
              </div>

              {tabs.map((tItem) => {
                const hidden = isTabHidden(tItem.id);
                return (
                  <div
                    key={tItem.id}
                    onClick={() => {
                      setTab(tItem.id);
                      if (tItem.id === "notes") setView("list");
                      if (tItem.id === "sport") setSportView("dashboard");
                      setSidePanelOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 8px",
                      borderRadius: 10,
                      marginBottom: 2,
                      opacity: hidden ? 0.55 : 1,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 22, display: "flex", justifyContent: "center" }}>
                      <Icon d={tItem.icon} size={17} color={hidden ? t.textMuted : t.text} />
                    </div>
                    <div style={{ flex: 1, fontSize: 14, color: t.text }}>{getTabLabel(tItem.id)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        hidden ? showTab(tItem.id) : hideTab(tItem.id);
                      }}
                      style={{
                        ...s.btn(hidden ? "primary" : "secondary"),
                        padding: "6px 12px",
       fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      {hidden ? "Показать" : "Скрыть"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div
            style={{
              borderTop: `1px solid ${t.border}`,
              padding: 12,
            }}
          >
            <button
              onClick={() => {
                setSidePanelOpen(false);
                setSettingsOpen(true);
                setSettingsSection(null);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 10px",
                borderRadius: 12,
                background: t.card,
                border: `1.5px solid ${t.border}`,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Icon
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                size={18}
                color={t.text}
              />
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>
                Настройки
              </div>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Settings full-screen overlay */}
    {settingsOpen && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 0,
          width: "100%",
          maxWidth: maxWidth,
          background: t.bg,
          zIndex: 2200,
          display: "flex",
          flexDirection: "column",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <div
          style={{
            padding: headerPadding,
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: t.surface,
            minHeight: isMobile ? (isLandscape ? "60px" : "56px") : "72px",
          }}
        >
          <button
            style={s.btn("ghost")}
            onClick={() => {
              if (settingsSection && appearanceSubview) {
                setAppearanceSubview(null);
              } else if (settingsSection) {
                setSettingsSection(null);
              } else {
                setSettingsOpen(false);
              }
            }}
          >
            <Icon d={icons.back} size={18} color={t.text} />
          </button>
          <div style={{ ...s.headerTitle }}>
            {!settingsSection && "⚙️ Настройки"}
            {settingsSection === "account" && "👤 Аккаунт"}
            {settingsSection === "library" && "📚 Библиотека"}
            {settingsSection === "language" && "🌐 Язык"}
            {settingsSection === "appearance" && !appearanceSubview && "🎨 Внешний вид"}
            {settingsSection === "appearance" && appearanceSubview === "palette" && "Цветовая палитра"}
            {settingsSection === "appearance" && appearanceSubview === "fontSize" && "Размер шрифта"}
            {settingsSection === "appearance" && appearanceSubview === "fontFamily" && "Шрифт"}
            {settingsSection === "agreement" && "📄 Соглашение"}
            {settingsSection === "help" && "❓ Помощь и обратная связь"}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: contentPadding }}>
          {/* Top-level settings list */}
          {!settingsSection && (
            <div>
              {[
                { id: "account", icon: icons.user, label: "Аккаунт" },
                { id: "library", icon: icons.library, label: "Библиотека" },
                { id: "language", icon: icons.globe, label: "Язык" },
                { id: "appearance", icon: icons.sun, label: "Внешний вид" },
                { id: "agreement", icon: icons.shield, label: "Соглашение об обслуживании" },
                { id: "help", icon: icons.help, label: "Помощь и обратная связь" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSettingsSection(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 14px",
                    borderRadius: 14,
                    background: t.card,
                    border: `1.5px solid ${t.border}`,
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: 10,
                  }}
                >
                  <Icon d={item.icon} size={19} color={t.accent} />
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text, flex: 1 }}>
                    {item.label}
                  </div>
                  <Icon d={icons.chevronRight} size={17} color={t.textMuted} />
                </button>
              ))}
            </div>
          )}

          {/* Секции настроек — для краткости опущены, но полностью есть в оригинале */}
          {settingsSection === "account" && <div>...</div>}
          {settingsSection === "library" && <div>...</div>}
          {settingsSection === "language" && <div>...</div>}
          {settingsSection === "appearance" && !appearanceSubview && <div>...</div>}
          {settingsSection === "appearance" && appearanceSubview === "palette" && <div>...</div>}
          {settingsSection === "appearance" && appearanceSubview === "fontSize" && <div>...</div>}
          {settingsSection === "appearance" && appearanceSubview === "fontFamily" && <div>...</div>}
          {settingsSection === "agreement" && <div>...</div>}
          {settingsSection === "help" && <div>...</div>}
        </div>
      </div>
    )}

    {/* Language selection modal */}
    {languageModalOpen && (
      <div
        style={s.modal}
        onClick={() => setLanguageModalOpen(false)}
      >
        <div
          style={{ ...s.modalContent, maxWidth: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>
            Выберите язык
          </div>

          <button
            onClick={() => setLanguageModalOpen(false)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px",
              borderRadius: 12,
              background: `${t.accent}14`,
              border: `2px solid ${t.accent}`,
              cursor: "pointer",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 14.5, fontWeight: 600, color: t.accent }}>
              Русский
            </span>
            <Icon d="M20 6L9 17l-5-5" size={16} color={t.accent} />
          </button>

          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 10, lineHeight: 1.5 }}>
            Другие языки появятся здесь в будущих обновлениях.
          </div>
        </div>
      </div>
    )}

    {/* Subnote overlay */}
    {subnoteOpenId && (
      <SubnoteOverlay
        note={data.notes.find((n) => n.id === subnoteOpenId)}
        onClose={() => setSubnoteOpenId(null)}
        theme={t}
        s={s}
      />
    )}
  </div>
);
