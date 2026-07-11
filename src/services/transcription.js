// transcription.js — конвертация длинных аудио (60-90+ минут) в текст.
//
// Проблема: Whisper API (и большинство подобных) принимает файл максимум ~25 МБ
// за один запрос. Часовая запись в среднем качестве весит больше.
// Решение: режем аудио на куски по CHUNK_SECONDS (с небольшим нахлёстом,
// чтобы не терять слова на границах), прогоняем куски через Whisper
// (можно параллельно, с ограничением одновременных запросов),
// затем склеиваем текст по порядку.

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { updateTranscriptionJob } from "../db.js";

ffmpeg.setFfmpegPath(ffmpegPath.path);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CHUNK_SECONDS = 8 * 60; // 8 минут на кусок — с запасом укладывается в лимит 25 МБ даже в хорошем качестве
const OVERLAP_SECONDS = 5; // небольшой нахлёст, чтобы не терять слова на стыке кусков
const MAX_PARALLEL = 3; // сколько кусков транскрибировать одновременно (не душим лимиты API)

function getDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

function extractChunk(inputPath, startSec, durationSec, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startSec)
      .duration(durationSec)
      // Понижаем до моно 16kHz mp3 — этого достаточно для распознавания речи,
      // а вес файла падает в разы, что ускоряет загрузку и обработку.
      .audioChannels(1)
      .audioFrequency(16000)
      .audioBitrate("64k")
      .format("mp3")
      .on("end", resolve)
      .on("error", reject)
      .save(outPath);
  });
}

async function transcribeChunk(filePath) {
  const res = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
    language: "ru",
    response_format: "text",
  });
  // SDK при response_format="text" возвращает строку напрямую
  return typeof res === "string" ? res : res.text || "";
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runOne() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await worker(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, runOne);
  await Promise.all(workers);
  return results;
}

/**
 * Обрабатывает длинный аудиофайл: режет на куски, транскрибирует каждый,
 * склеивает результат, обновляет прогресс в БД по мере готовности.
 *
 * @param {string} inputPath - путь к исходному аудиофайлу на диске
 * @param {string} jobId - id задачи в таблице transcription_jobs, для обновления прогресса
 * @returns {Promise<string>} итоговый текст
 */
export async function transcribeLongAudio(inputPath, jobId) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "smartnotes-chunks-"));

  try {
    updateTranscriptionJob(jobId, { status: "processing", progress: 2 });

    const duration = await getDuration(inputPath);
    const chunkCount = Math.max(1, Math.ceil(duration / CHUNK_SECONDS));

    // 1. Нарезаем на файлы-куски
    const chunkPaths = [];
    for (let i = 0; i < chunkCount; i++) {
      const start = Math.max(0, i * CHUNK_SECONDS - (i > 0 ? OVERLAP_SECONDS : 0));
      const len = Math.min(CHUNK_SECONDS + OVERLAP_SECONDS, duration - start);
      const outPath = path.join(tmpDir, `chunk_${String(i).padStart(3, "0")}.mp3`);
      await extractChunk(inputPath, start, len, outPath);
      chunkPaths.push(outPath);
    }

    updateTranscriptionJob(jobId, { progress: 15 });

    // 2. Транскрибируем куски (с ограниченным параллелизмом)
    let done = 0;
    const texts = await runWithConcurrency(chunkPaths, MAX_PARALLEL, async (chunkPath) => {
      const text = await transcribeChunk(chunkPath);
      done++;
      const progress = 15 + Math.round((done / chunkPaths.length) * 80);
      updateTranscriptionJob(jobId, { progress });
      return text;
    });

    // 3. Склеиваем по порядку
    const fullText = texts.map((t) => t.trim()).filter(Boolean).join("\n\n");

    updateTranscriptionJob(jobId, {
      status: "done",
      progress: 100,
      result_text: fullText,
    });

    return fullText;
  } catch (err) {
    updateTranscriptionJob(jobId, {
      status: "error",
      error: err.message || String(err),
    });
    throw err;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export function makeJobId() {
  return uuidv4();
}
