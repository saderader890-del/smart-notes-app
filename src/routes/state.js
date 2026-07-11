// routes/state.js — синхронизация полного состояния приложения (заметки, чек-листы,
// события, тренировки, тесты) между клиентом и сервером. Так фронтенд может либо
// продолжать работать локально и просто "бэкапить" данные на сервер, либо полностью
// перейти на серверное хранилище, чтобы ИИ и клиент всегда видели одни и те же данные.

import express from "express";
import { getState, setState } from "../db.js";

const router = express.Router();

// GET /api/state — получить всё состояние пользователя
router.get("/", (req, res) => {
  res.json(getState(req.userId));
});

// PUT /api/state — полностью перезаписать состояние (например при первой синхронизации
// с локального localStorage на сервер)
router.put("/", (req, res) => {
  const state = setState(req.userId, req.body);
  res.json(state);
});

export default router;
