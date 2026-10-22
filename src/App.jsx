import { useState } from "react";
import "./App.css";

export default function App() {
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const daysLeft = deadline
    ? Math.max(1, Math.ceil((new Date(deadline) - new Date()) / 86400000))
    : 3;

  async function generatePlan() {
    if (!brief.trim()) return setError("Paste your assignment first.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, daysLeft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTasks(data.tasks.map((t, i) => ({ ...t, id: i, done: false })));
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  }

  function toggle(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const doneCount = tasks.filter((t) => t.done).length;
  const percent = tasks.length
    ? Math.round((doneCount / tasks.length) * 100)
    : 0;
  const days = [...new Set(tasks.map((t) => t.day))];

  return (
    <div className="app">
      <h1>📚 Assignment Breaker</h1>
      <p className="sub">Paste your assignment. Get a day-by-day plan.</p>

      <textarea
        placeholder="Paste your assignment or project brief here..."
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={7}
      />

      <label className="row">
        Deadline:
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </label>

      <button onClick={generatePlan} disabled={loading}>
        {loading ? "Building your plan..." : "Break it down"}
      </button>
      {error && <p className="error">{error}</p>}

      {tasks.length > 0 && (
        <div className="plan">
          <div className="bar">
            <div className="fill" style={{ width: percent + "%" }} />
          </div>
          <p className="sub">
            {doneCount}/{tasks.length} done ({percent}%)
          </p>

          {days.map((d) => (
            <div key={d} className="day">
              <h3>Day {d}</h3>
              {tasks
                .filter((t) => t.day === d)
                .map((t) => (
                  <label key={t.id} className={t.done ? "task done" : "task"}>
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggle(t.id)}
                    />
                    <span>{t.title}</span>
                    <small>{t.minutes} min</small>
                  </label>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
