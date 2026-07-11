// routes/transcribe.js — приём аудио от приложения (запись с микрофона или загруженный файл),
// запуск обработки в фоне, и отдельный эндпоинт для опроса прогресса.
//
// Почему асинхронно: транскрипция часового аудио может занимать несколько минут.
// Держать HTTP-соединение открытым всё это время ненадёжно (мобильная сеть может
// оборваться). Вместо этого:
//   1. POST /api/transcribe/upload -> сразу возвращает jobId
//   2. GET  /api/transcribe/status/:jobId -> приложение опрашивает раз в 2-3 сек,
//      получает progress (0-100) и, когда status === "done", сам текст.

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { transcribeLongAudio, makeJobId } from "../services/transcription.js";
import { createTranscriptionJob, getTranscriptionJob } from "../db.js";

const router = express.Router();

const upload = multer({
  dest: path.join(os.tmpdir(), "smartnotes-uploads"),
  limits: {
    fileSize: (parseInt(process.env.MAX_AUDIO_MB, 10) || 300) * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const okTypes = [
      "audio/mpeg",
      "audio/mp4",
      "audio/x-m4a",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/aac",
      "video/mp4", // некоторые телефоны пишут голос в .mp4-контейнер
    ];
    if (okTypes.includes(file.mimetype) || /\.(mp3|m4a|wav|webm|ogg|aac|mp4)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Неподдерживаемый формат аудио"));
    }
  },
});

// POST /api/transcribe/upload
// multipart/form-data, поле "audio"
router.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл audio не найден в запросе" });
  }

  const userId = req.userId; // проставляется middleware'ом аутентификации
  const jobId = makeJobId();
  createTranscriptionJob(jobId, userId);

  // Отвечаем сразу — обработка идёт в фоне
  res.json({ jobId, status: "queued" });

  const filePath = req.file.path;

  // Запускаем обработку не блокируя ответ. Ошибки уже логируются
  // и сохраняются в job через transcribeLongAudio -> updateTranscriptionJob.
  transcribeLongAudio(filePath, jobId)
    .catch((err) => console.error(`[transcribe] job ${jobId} failed:`, err))
    .finally(() => {
      fs.unlink(filePath, () => {});
    });
});

// GET /api/transcribe/status/:jobId
router.get("/status/:jobId", (req, res) => {
  const job = getTranscriptionJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Задача не найдена" });

  // Дополнительно проверяем, что задача принадлежит текущему пользователю
  if (job.user_id !== req.userId) {
    return res.status(403).json({ error: "Нет доступа к этой задаче" });
  }

  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    text: job.status === "done" ? job.result_text : undefined,
    error: job.status === "error" ? job.error : undefined,
  });
});

export default router;
