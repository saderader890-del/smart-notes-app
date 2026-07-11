import "dotenv/config";
import express from "express";
import cors from "cors";

import { requireUser } from "./middleware/auth.js";
import transcribeRouter from "./routes/transcribe.js";
import chatRouter from "./routes/chat.js";
import stateRouter from "./routes/state.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

// Все роуты ниже требуют идентификации пользователя (см. middleware/auth.js)
app.use("/api/transcribe", requireUser, transcribeRouter);
app.use("/api/chat", requireUser, chatRouter);
app.use("/api/state", requireUser, stateRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SmartNotes backend запущен на http://localhost:${PORT}`);
});
