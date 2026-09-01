import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "references.json");

const MAX_CHARS_PER_DOC = 20000;

function readAll() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function writeAll(items) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function listReferences() {
  return readAll()
    .map(({ text, ...meta }) => ({ ...meta, textLength: text.length }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveReference({ id, subject, filename, text, createdAt }) {
  const items = readAll();
  items.push({ id, subject, filename, text: text.slice(0, MAX_CHARS_PER_DOC), createdAt });
  writeAll(items);
}

export function deleteReference(id) {
  const items = readAll();
  const next = items.filter((item) => item.id !== id);
  const removed = next.length !== items.length;
  if (removed) writeAll(next);
  return removed;
}

// Returns a bounded chunk of concatenated reference text for the given subject,
// so the AI prompt is grounded in the teacher's own curriculum material.
export function getReferenceContext(subject, maxChars = 15000) {
  const items = readAll().filter((item) => item.subject === subject);
  if (!items.length) return "";

  let combined = "";
  for (const item of items) {
    const chunk = `\n\n[מקור: ${item.filename}]\n${item.text}`;
    if (combined.length + chunk.length > maxChars) {
      combined += chunk.slice(0, maxChars - combined.length);
      break;
    }
    combined += chunk;
  }
  return combined.trim();
}
