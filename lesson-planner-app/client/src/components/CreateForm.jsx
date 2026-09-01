import { useState } from "react";
import MarkdownView from "./MarkdownView.jsx";
import { generateContent, saveLessonPlan, exportFile } from "../api.js";

const SUBJECTS = [
  { value: "science", label: "מדעים" },
  { value: "math", label: "מתמטיקה" },
  { value: "minecraft", label: "Minecraft Education" },
];

const CONTENT_TYPES = [
  { value: "lesson-plan", label: "מערך שיעור" },
  { value: "presentation", label: "מצגת" },
];

export default function CreateForm({ hasAiKey }) {
  const [subject, setSubject] = useState("science");
  const [contentType, setContentType] = useState("lesson-plan");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("ה");
  const [duration, setDuration] = useState("45");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState("");

  async function handleGenerate(e) {
    e.preventDefault();
    if (!topic.trim()) {
      setError("נא להזין נושא לשיעור");
      return;
    }
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const data = await generateContent({ subject, grade, topic, contentType, duration, notes });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await saveLessonPlan({ subject, grade, topic, contentType, content: result.content, title: topic });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExport(format) {
    setExporting(format);
    try {
      await exportFile(format, { title: topic, content: result.content });
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting("");
    }
  }

  return (
    <div className="screen">
      {!hasAiKey && (
        <div className="notice">
          לא הוגדר מפתח AI בשרת - התוכן שייווצר יהיה תוכן דוגמה בלבד. אפשר להוסיף
          מפתח בקובץ <code>.env</code> בשרת בהמשך.
        </div>
      )}

      <form onSubmit={handleGenerate} className="card">
        <label>
          מקצוע
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          סוג תוכן
          <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
            {CONTENT_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          נושא השיעור
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="לדוגמה: מעגל המים בטבע"
          />
        </label>

        <div className="row">
          <label>
            כיתה
            <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} />
          </label>
          <label>
            משך (דקות)
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </label>
        </div>

        <label>
          הערות נוספות (אופציונלי)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="primary" disabled={loading}>
          {loading ? "יוצר תוכן..." : "צור תוכן"}
        </button>
      </form>

      {result && (
        <div className="card result">
          {result.source === "fallback" && (
            <div className="notice">זהו תוכן דוגמה (אין מפתח AI מוגדר בשרת).</div>
          )}
          <MarkdownView content={result.content} />

          <div className="actions">
            <button onClick={handleSave} disabled={saved}>
              {saved ? "נשמר ✓" : "שמור מערך"}
            </button>
            {contentType === "presentation" ? (
              <button onClick={() => handleExport("pptx")} disabled={exporting === "pptx"}>
                {exporting === "pptx" ? "מייצא..." : "הורד PPTX"}
              </button>
            ) : (
              <>
                <button onClick={() => handleExport("docx")} disabled={exporting === "docx"}>
                  {exporting === "docx" ? "מייצא..." : "הורד Word"}
                </button>
                <button onClick={() => handleExport("pdf")} disabled={exporting === "pdf"}>
                  {exporting === "pdf" ? "מייצא..." : "הורד PDF"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
