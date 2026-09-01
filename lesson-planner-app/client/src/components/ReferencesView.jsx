import { useEffect, useRef, useState } from "react";
import { listReferences, uploadReference, deleteReference } from "../api.js";

const SUBJECTS = [
  { value: "science", label: "מדעים" },
  { value: "math", label: "מתמטיקה" },
  { value: "minecraft", label: "Minecraft Education" },
];
const SUBJECT_LABELS = Object.fromEntries(SUBJECTS.map((s) => [s.value, s.label]));

export default function ReferencesView() {
  const [items, setItems] = useState([]);
  const [subject, setSubject] = useState("science");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  async function refresh() {
    try {
      setItems(await listReferences());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setError("נא לבחור קובץ PDF");
      return;
    }
    setError("");
    setUploading(true);
    try {
      await uploadReference(subject, file);
      fileInput.current.value = "";
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReference(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="screen">
      <div className="notice">
        העלו כאן ספרי לימוד או מסמכי תכנית לימודים (PDF) של משרד החינוך. כשתיצרו
        מערך שיעור או מצגת באותו מקצוע, הבינה המלאכותית תתבסס על החומר שהעליתם.
      </div>

      <form onSubmit={handleUpload} className="card">
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
          קובץ PDF
          <input type="file" accept="application/pdf" ref={fileInput} />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary" disabled={uploading}>
          {uploading ? "מעלה..." : "העלה קובץ"}
        </button>
      </form>

      {items.map((item) => (
        <div key={item.id} className="card list-item-header">
          <span className="title">{item.filename}</span>
          <span className="tags">
            {SUBJECT_LABELS[item.subject]} · {item.textLength.toLocaleString("he-IL")} תווים
          </span>
          <button className="danger" onClick={() => handleDelete(item.id)}>
            מחק
          </button>
        </div>
      ))}
    </div>
  );
}
