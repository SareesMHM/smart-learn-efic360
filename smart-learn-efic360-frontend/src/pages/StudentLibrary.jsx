// src/pages/StudentLibrary.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/* Keep these in sync with backend enums */
const SUBJECTS = ["English", "Maths", "Tamil", "Science", "History", "IT"];
const GRADES = [6, 7, 8, 9, 10, 11];
const TYPES = ["video", "pdf", "assignment", "notes", "link", "quiz", "chatbot"];

export default function StudentLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filters, setFilters] = useState({ subject: "", grade: "", type: "", q: "" });

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    axios
      .get("/api/materials") // server-side filters optional: { params: filters }
      .then((res) => {
        if (!mounted) return;
        setItems(res.data || []);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e?.response?.data?.message || "Failed to load materials.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return (items || []).filter((m) => {
      if (filters.subject && m.subject !== filters.subject) return false;
      if (filters.grade && String(m.grade) !== String(filters.grade)) return false;
      if (filters.type && m.type !== filters.type) return false;
      if (!q) return true;
      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (m.subject || "").toLowerCase().includes(q) ||
        String(m.grade || "").toLowerCase().includes(q) ||
        (m.type || "").toLowerCase().includes(q)
      );
    });
  }, [items, filters]);

  const countByType = useMemo(() => {
    const acc = {};
    for (const t of TYPES) acc[t] = 0;
    for (const m of filtered) acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, [filtered]);

  return (
    <div className="library container">
      <div className="lib-head">
        <h2>Course Materials</h2>
        <div className="lib-filters">
          <select
            value={filters.subject}
            onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
          >
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filters.grade}
            onChange={(e) => setFilters((f) => ({ ...f, grade: e.target.value }))}
          >
            <option value="">All grades</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <input
            className="cm-search"
            placeholder="Search title, description…"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
        </div>
      </div>

      {/* Quick counts by type */}
      <div className="lib-stats">
        {TYPES.map((t) => (
          <span key={t} className="pill" title={t}>
            {t}: {countByType[t] || 0}
          </span>
        ))}
      </div>

      {err && <div className="cm-toast">{err}</div>}
      {loading && <p className="muted">Loading materials…</p>}

      {!loading && filtered.length === 0 && (
        <p className="muted">No materials match your filters.</p>
      )}

      <ul className="cm-list">
        {filtered.map((m) => {
          const isQuiz = m.type === "quiz";
          const isAssignment = m.type === "assignment";
          const expiresAt = m.meta?.expiresAt ? new Date(m.meta.expiresAt) : null;
          const quizExpired = isQuiz && expiresAt && expiresAt < new Date();
          const dueDate = isAssignment && m.meta?.dueDate ? new Date(m.meta.dueDate) : null;
          const isPastDue = isAssignment && dueDate && dueDate < new Date();

          return (
            <li key={m._id} className="cm-item">
              <div className="cm-meta">
                <div className="row">
                  <div className={`type-badge t-${m.type}`}>{m.type}</div>
                  {m.subject && <div className="pill">{m.subject}</div>}
                  {m.grade && <div className="pill">Grade {m.grade}</div>}
                  {isQuiz && expiresAt && (
                    <div className={`pill ${quizExpired ? "pill-danger" : "pill-info"}`}>
                      {quizExpired ? "Expired" : "Closes"}: {expiresAt.toLocaleString()}
                    </div>
                  )}
                  {isAssignment && dueDate && (
                    <div className={`pill ${isPastDue ? "pill-danger" : "pill-info"}`}>
                      Due: {dueDate.toLocaleDateString()}
                    </div>
                  )}
                </div>

                <h4 className="cm-title">{m.title}</h4>
                {m.description && <p className="cm-desc">{m.description}</p>}

                {/* Type-specific summary */}
                {m.type === "notes" && (
                  <p className="muted">
                    {(m.meta?.content || "").slice(0, 120)}
                    {(m.meta?.content || "").length > 120 ? "…" : ""}
                  </p>
                )}
                {isAssignment && (
                  <p className="muted">
                    Max Marks: {m.meta?.maxMarks ?? 100}
                    {isPastDue ? " · (Late submissions allowed; may incur penalty)" : ""}
                  </p>
                )}
                {isQuiz && (
                  <p className="muted">
                    Questions: {m.meta?.questions?.length || 0}
                    {m.meta?.totalPoints ? ` · Total: ${m.meta.totalPoints}` : ""}
                  </p>
                )}
              </div>

              <div className="cm-links">
                {/* VIDEO */}
                {m.type === "video" &&
                  (m.link ? (
                    <a className="btn ghost" href={m.link} target="_blank" rel="noreferrer">
                      Watch
                    </a>
                  ) : m.file ? (
                    <video controls width="360" src={`/uploads/${m.file}`} />
                  ) : null)}

                {/* PDF */}
                {m.type === "pdf" && m.file && (
                  <a className="btn ghost" href={`/uploads/${m.file}`} target="_blank" rel="noreferrer">
                    Open PDF
                  </a>
                )}

                {/* NOTES */}
                {m.type === "notes" && (
                  <Link className="btn ghost" to={`/student/material/${m._id}`}>
                    Read
                  </Link>
                )}

                {/* LINK */}
                {m.type === "link" && m.link && (
                  <a className="btn ghost" href={m.link} target="_blank" rel="noreferrer">
                    Open Link
                  </a>
                )}

                {/* ASSIGNMENT */}
                {isAssignment && <AssignmentSubmitButton assignment={m} />}

                {/* QUIZ */}
                {isQuiz && (
                  quizExpired ? (
                    <button className="btn" disabled title="This quiz is closed.">
                      Quiz Closed
                    </button>
                  ) : (
                    <Link className="btn primary" to={`/student/quiz/${m._id}`}>
                      Take Quiz
                    </Link>
                  )
                )}
                

                {/* CHATBOT (FAQ) */}
                {m.type === "chatbot" && (
                  <Link className="btn ghost" to={`/chatbot?kb=${m._id}`}>
                    View FAQs
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- Assignment submit ---------------- */
function AssignmentSubmitButton({ assignment }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!file) return setMsg("Choose a file first (PDF).");
    const fd = new FormData();
    fd.append("file", file);
    try {
      setSubmitting(true);
      setMsg("");
      // If your route is different, adjust here (e.g., /api/assignments/:id/submit)
      await axios.post(`/api/assignment/${assignment._id}/submit`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(" Submitted");
      setFile(null);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="assign-submit">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button className="btn" onClick={submit} disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Assignment"}
      </button>
      {msg && <p className="muted" style={{ marginTop: 6 }}>{msg}</p>}
    </div>
  );
}
