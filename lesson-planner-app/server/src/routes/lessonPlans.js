import { Router } from "express";
import { randomUUID } from "node:crypto";
import { listLessonPlans, getLessonPlan, saveLessonPlan, deleteLessonPlan } from "../lib/store.js";
import { SUBJECTS, CONTENT_TYPES } from "../lib/prompts.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(listLessonPlans());
});

router.get("/:id", (req, res) => {
  const item = getLessonPlan(req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  res.json(item);
});

router.post("/", (req, res) => {
  const { subject, grade, topic, contentType, content, title } = req.body ?? {};

  if (!subject || !SUBJECTS[subject]) {
    return res.status(400).json({ error: `subject must be one of: ${Object.keys(SUBJECTS).join(", ")}` });
  }
  if (!contentType || !CONTENT_TYPES[contentType]) {
    return res.status(400).json({ error: `contentType must be one of: ${Object.keys(CONTENT_TYPES).join(", ")}` });
  }
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "content is required" });
  }

  const item = {
    id: randomUUID(),
    subject,
    grade: grade || SUBJECTS[subject].defaultGrade,
    topic: topic || "",
    contentType,
    title: title || topic || CONTENT_TYPES[contentType],
    content,
    createdAt: new Date().toISOString(),
  };

  saveLessonPlan(item);
  res.status(201).json(item);
});

router.delete("/:id", (req, res) => {
  const removed = deleteLessonPlan(req.params.id);
  if (!removed) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

export default router;
