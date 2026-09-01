import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { listReferences, saveReference, deleteReference } from "../lib/referenceStore.js";
import { SUBJECTS } from "../lib/prompts.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("only PDF files are supported"));
    }
    cb(null, true);
  },
});

const router = Router();

router.get("/", (_req, res) => {
  res.json(listReferences());
});

router.post("/", upload.single("file"), async (req, res) => {
  const { subject } = req.body ?? {};
  if (!subject || !SUBJECTS[subject]) {
    return res.status(400).json({ error: `subject must be one of: ${Object.keys(SUBJECTS).join(", ")}` });
  }
  if (!req.file) {
    return res.status(400).json({ error: "file (PDF) is required" });
  }

  try {
    const parsed = await pdfParse(req.file.buffer);
    const id = randomUUID();
    saveReference({
      id,
      subject,
      filename: req.file.originalname,
      text: parsed.text,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id, subject, filename: req.file.originalname, textLength: parsed.text.length });
  } catch (err) {
    console.error("pdf parse failed", err);
    res.status(400).json({ error: "could not read PDF", detail: err.message });
  }
});

router.delete("/:id", (req, res) => {
  const removed = deleteReference(req.params.id);
  if (!removed) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

export default router;
