import { useEffect, useState } from "react";
import MarkdownView from "./MarkdownView.jsx";
import { listLessonPlans, deleteLessonPlan, exportFile } from "../api.js";

const SUBJECT_LABELS = { science: "מדעים", math: "מתמטיקה", minecraft: "Minecraft Education" };
const TYPE_LABELS = { "lesson-plan": "מערך שיעור", presentation: "מצגת" };

export default function SavedList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [exporting, setExporting] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listLessonPlans());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id) {
    try {
      await deleteLessonPlan(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExport(item, format) {
    setExporting(item.id + format);
    try {
      await exportFile(format, { title: item.title, content: item.content });
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting("");
    }
  }

  if (loading) return <div className="screen">טוען...</div>;

  return (
    <div className="screen">
      {error && <div className="error">{error}</div>}
      {!items.length && <div className="notice">עדיין לא שמרתם מערכי שיעור או מצגות.</div>}

      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="card">
            <button className="list-item-header" onClick={() => setOpenId(isOpen ? null : item.id)}>
              <span className="title">{item.title}</span>
              <span className="tags">
                {SUBJECT_LABELS[item.subject]} · {TYPE_LABELS[item.contentType]} · כיתה {item.grade}
              </span>
            </button>

            {isOpen && (
              <>
                <MarkdownView content={item.content} />
                <div className="actions">
                  {item.contentType === "presentation" ? (
                    <button
                      onClick={() => handleExport(item, "pptx")}
                      disabled={exporting === item.id + "pptx"}
                    >
                      הורד PPTX
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleExport(item, "docx")}
                        disabled={exporting === item.id + "docx"}
                      >
                        הורד Word
                      </button>
                      <button
                        onClick={() => handleExport(item, "pdf")}
                        disabled={exporting === item.id + "pdf"}
                      >
                        הורד PDF
                      </button>
                    </>
                  )}
                  <button className="danger" onClick={() => handleDelete(item.id)}>
                    מחק
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
