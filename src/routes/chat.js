// routes/chat.js — чат с ИИ, который может реально управлять данными приложения.
//
// Как это работает:
// 1. Пользователь пишет сообщение ("добавь событие 10 числа смена сутки").
// 2. Мы отправляем его модели вместе со списком доступных функций (tools/definitions.js).
// 3. Модель решает, надо ли вызвать функцию, и если да — с какими аргументами.
// 4. Мы выполняем функцию (tools/handlers.js), которая реально меняет БД пользователя.
// 5. Результат выполнения (например { success: true, event: {...} }) отправляем
//    обратно модели, чтобы она сформулировала понятный ответ пользователю.
// 6. Шаги 2-5 повторяются в цикле, пока модель не перестанет вызывать функции —
//    это позволяет делать цепочки типа "найди информацию -> сохрани её в заметку".

import express from "express";
import OpenAI from "openai";
import { toolDefinitions } from "../tools/definitions.js";
import { executeTool } from "../tools/handlers.js";
import { getState, patchState } from "../db.js";

const router = express.Router();

// DeepSeek API полностью совместим с форматом OpenAI SDK — меняется только
// base_url и ключ. Все остальные вызовы (chat.completions.create, tools,
// message.tool_calls) работают один в один, как с OpenAI.
// Whisper (транскрипция аудио, services/transcription.js) у DeepSeek нет,
// так что для неё отдельно используется обычный OpenAI-клиент — это
// нормальная гибридная схема: разные провайдеры для разных задач.
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

// deepseek-v4-flash — быстрее и дешевле, хорошо подходит под function calling
// без глубоких рассуждений (создание заметок/событий/чек-листов).
// Если понадобится более качественное распознавание сложных/неоднозначных
// запросов — можно переключить на "deepseek-v4-pro".
const MODEL = "deepseek-v4-flash";

const MAX_TOOL_ITERATIONS = 5; // защита от зацикливания

function buildSystemPrompt(state) {
  const notesPreview = state.notes
    .slice(0, 20)
    .map((n) => `- [${n.id}] ${n.title}`)
    .join("\n");

  return `Ты — ассистент приложения SmartNotes. У тебя есть доступ к функциям, которые позволяют
реально создавать и изменять данные пользователя: заметки, чек-листы, события календаря,
тренировки и тесты. Когда пользователь просит что-то создать или добавить — вызывай
соответствующую функцию, а не просто описывай, что бы ты сделал.

Если для выполнения просьбы не хватает данных (например неясна точная дата или формулировка
графика смен) — сначала уточни у пользователя, а не додумывай.

Сегодняшняя дата: ${new Date().toISOString().slice(0, 10)}.

Некоторые из последних заметок пользователя (используй search_notes для полного поиска):
${notesPreview || "Заметок пока нет."}

Отвечай кратко и по делу, на русском языке.`;
}

router.post("/message", async (req, res) => {
  const userId = req.userId;
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Поле message обязательно" });
  }

  const state = getState(userId);
  const userMsg = { role: "user", content: message };
  const history = [...state.chatHistory, userMsg];

  // Сразу сохраняем сообщение пользователя, чтобы не потерять его при ошибке ниже
  patchState(userId, { chatHistory: history });

  try {
    const messages = [
      { role: "system", content: buildSystemPrompt(state) },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    const toolCallsLog = [];
    let finalReplyText = "";

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const completion = await deepseek.chat.completions.create({
        model: MODEL,
        messages,
        tools: toolDefinitions,
        tool_choice: "auto",
      });

      const choice = completion.choices[0];
      const assistantMsg = choice.message;

      // Важно: в историю сообщений (messages) кладём ответ модели как есть.
      // Если позже включишь thinking-режим DeepSeek (reasoning_effort/thinking:{enabled:true}),
      // не добавляй assistantMsg.reasoning_content в последующие сообщения истории —
      // только content и tool_calls. Иначе качество ответов заметно падает
      // (это прямая рекомендация в документации DeepSeek).
      messages.push(assistantMsg);

      const calls = assistantMsg.tool_calls || [];

      if (calls.length === 0) {
        // Модель дала финальный текстовый ответ — выходим из цикла
        finalReplyText = assistantMsg.content || "";
        break;
      }

      // Выполняем все запрошенные функции и возвращаем результаты модели
      for (const call of calls) {
        const args = JSON.parse(call.function.arguments || "{}");
        const result = await executeTool(userId, call.function.name, args);

        toolCallsLog.push({ name: call.function.name, args, result });

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      // Цикл повторится: модель увидит результаты функций и либо вызовет ещё одну,
      // либо сформулирует финальный ответ.
    }

    const finalState = getState(userId); // могла измениться внутри executeTool
    const nextHistory = [
      ...finalState.chatHistory,
      { role: "assistant", content: finalReplyText || "Готово." },
    ];
    patchState(userId, { chatHistory: nextHistory });

    res.json({
      reply: finalReplyText || "Готово.",
      toolCalls: toolCallsLog, // фронтенд может показать "✅ Событие создано" и т.п.
    });
  } catch (err) {
    console.error("[chat] error:", err);
    const errState = getState(userId);
    patchState(userId, {
      chatHistory: [
        ...errState.chatHistory,
        { role: "assistant", content: "Ошибка соединения. Попробуйте снова." },
      ],
    });
    res.status(500).json({ error: "Ошибка при обращении к ИИ" });
  }
});

export default router;
