import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function QuizResults() {
  const { id, quizId: qid } = useParams();
  const quizId = id || qid;

  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!quizId) {
        setErr("Missing quiz id from route.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr("");
      try {
        // Teacher/Admin endpoint
        const r = await axios.get(`/api/quiz/${quizId}/attempts`, { params: { page: 1, limit: 50 } });
        setRows(r.data?.data ?? r.data ?? []);
      } catch (e) {
        const s = e?.response?.status;
        if (s === 401 || s === 403) {
          // Student endpoint fallback
          try {
            const me = await axios.get(`/api/me/quiz-attempts`, { params: { page: 1, limit: 50 } });
            const all = me.data?.data ?? [];
            setRows(all.filter(a => (a.quiz?._id || a.quiz) === quizId));
          } catch (e2) {
            setErr(e2?.response?.data?.message || e2.message || "Failed to load results.");
          }
        } else {
          setErr(e?.response?.data?.message || e.message || "Failed to load results.");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [quizId]);

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>{err}</p>;

  return (
    <div className="container">
      <h2>Quiz Results</h2>
      {rows.length ? (
        <ul>
          {rows.map(a => (
            <li key={a._id || a.attemptId}>
              {a.student?.name || "You"} — {a.score}/{a.maxScore} ({a.percent}%)
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No attempts found for this quiz.</p>
      )}
    </div>
  );
}
