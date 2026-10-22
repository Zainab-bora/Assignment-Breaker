import { useState, useEffect } from "react";
import "./App.css";

const LOADING_MESSAGES = [
  "Reading your assignment...",
  "Figuring out what matters most...",
  "Splitting it into small tasks...",
  "Spreading the work across your days...",
  "Almost done, polishing your plan...",
];

export default function App() {
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);

  // Loading simulation: rotate messages and slowly fill a fake progress bar
  useEffect(() => {
    if (!loading) return;
    setMsgIndex(0);
    setFakeProgress(5);

    const msgTimer = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 1200);

    const progressTimer = setInterval(() => {
      // moves fast at first, then slows down, and never reaches 100
      setFakeProgress((p) => (p < 90 ? p + (95 - p) * 0.08 : p));
    }, 300);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
    };
  }, [loading]);

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

  function startNew() {
    setBrief("");
    setDeadline("");
    setTasks([]);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const doneCount = tasks.filter((t) => t.done).length;
  const percent = tasks.length
    ? Math.round((doneCount / tasks.length) * 100)
    : 0;
  const allDone = tasks.length > 0 && doneCount === tasks.length;
  const days = [...new Set(tasks.map((t) => t.day))];

  return (
    <div className="app">
      <h1>📚 Assignment Breaker</h1>
      <p className="sub">Paste your assignment. Get a day-by-day plan.</p>

      {/* INPUT AREA: shown only when there is no plan yet */}
      {tasks.length === 0 && !loading && (
        <>
          <textarea
            placeholder="Paste your assignment or project brief here..."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={7}
            disabled={loading}
          />

          <label className="row">
            Deadline:
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={loading}
            />
          </label>

          <button onClick={generatePlan} disabled={loading}>
            {loading ? "Building your plan..." : "Break it down"}
          </button>
          {error && <p className="error">{error}</p>}
        </>
      )}

      {/* LOADING SIMULATION */}
      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p className="loading-msg">{LOADING_MESSAGES[msgIndex]}</p>
          <div className="bar">
            <div
              className="fill loading-fill"
              style={{ width: fakeProgress + "%" }}
            />
          </div>
        </div>
      )}

      {/* PLAN */}
      {tasks.length > 0 && (
        <div className="plan">
          {!allDone && (
            <p className="hint">
              Want to start a new assignment before finishing this one?{" "}
              <button
                className="hint-link"
                onClick={() =>
                  document
                    .getElementById("new-assignment")
                    .scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                Jump to the bottom ↓
              </button>
            </p>
          )}
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

          {allDone ? (
            <div className="finished">
              <p>🎉 All tasks done! Great work.</p>
              <button onClick={startNew}>
                Break down your next assignment
              </button>
            </div>
          ) : (
            <button className="link-btn" onClick={startNew}>
              ← Start a new assignment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
