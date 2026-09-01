import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "lesson-plans.json");

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

export function listLessonPlans() {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLessonPlan(id) {
  return readAll().find((item) => item.id === id) ?? null;
}

export function saveLessonPlan(item) {
  const items = readAll();
  items.push(item);
  writeAll(items);
  return item;
}

export function deleteLessonPlan(id) {
  const items = readAll();
  const next = items.filter((item) => item.id !== id);
  const removed = next.length !== items.length;
  if (removed) writeAll(next);
  return removed;
}
