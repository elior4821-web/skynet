import { Router } from "express";
import { generateLessonContent } from "../lib/aiClient.js";
import { SUBJECTS, CONTENT_TYPES } from "../lib/prompts.js";
import { getReferenceContext } from "../lib/referenceStore.js";

const router = Router();

router.post("/", async (req, res) => {
  const { subject, grade, topic, contentType, duration, notes } = req.body ?? {};

  if (!subject || !SUBJECTS[subject]) {
    return res.status(400).json({ error: `subject must be one of: ${Object.keys(SUBJECTS).join(", ")}` });
  }
  if (!contentType || !CONTENT_TYPES[contentType]) {
    return res.status(400).json({ error: `contentType must be one of: ${Object.keys(CONTENT_TYPES).join(", ")}` });
  }
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "topic is required" });
  }

  try {
    const result = await generateLessonContent({
      subject,
      grade: grade || SUBJECTS[subject].defaultGrade,
      topic: topic.trim(),
      contentType,
      duration,
      notes,
      referenceContext: getReferenceContext(subject),
    });
    res.json(result);
  } catch (err) {
    console.error("generation failed", err);
    res.status(502).json({ error: "AI generation failed", detail: err.message });
  }
});

export default router;
