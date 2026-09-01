import "dotenv/config";
import express from "express";
import cors from "cors";
import generateRouter from "./routes/generate.js";
import lessonPlansRouter from "./routes/lessonPlans.js";
import referencesRouter from "./routes/references.js";
import exportRouter from "./routes/export.js";
import { SUBJECTS, CONTENT_TYPES } from "./lib/prompts.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasAiKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.get("/api/meta", (_req, res) => {
  res.json({ subjects: SUBJECTS, contentTypes: CONTENT_TYPES });
});

app.use("/api/generate", generateRouter);
app.use("/api/lesson-plans", lessonPlansRouter);
app.use("/api/references", referencesRouter);
app.use("/api/export", exportRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "internal error" });
});

app.listen(PORT, () => {
  console.log(`lesson-planner server listening on http://localhost:${PORT}`);
});
