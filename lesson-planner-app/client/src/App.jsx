import { useEffect, useState } from "react";
import CreateForm from "./components/CreateForm.jsx";
import SavedList from "./components/SavedList.jsx";
import ReferencesView from "./components/ReferencesView.jsx";
import { getHealth } from "./api.js";
import "./App.css";

const TABS = [
  { key: "create", label: "יצירה", icon: "✨" },
  { key: "saved", label: "שמורים", icon: "📚" },
  { key: "references", label: "חומרי מקור", icon: "📄" },
];

export default function App() {
  const [tab, setTab] = useState("create");
  const [hasAiKey, setHasAiKey] = useState(true);

  useEffect(() => {
    getHealth()
      .then((h) => setHasAiKey(h.hasAiKey))
      .catch(() => {});
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>העוזר הווירטואלי להוראה</h1>
        <p>מערכי שיעור ומצגות למדעים, מתמטיקה ו-Minecraft Education, כיתה ה'</p>
      </header>

      <main className="app-main">
        {tab === "create" && <CreateForm hasAiKey={hasAiKey} />}
        {tab === "saved" && <SavedList />}
        {tab === "references" && <ReferencesView />}
      </main>

      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            <span className="icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
