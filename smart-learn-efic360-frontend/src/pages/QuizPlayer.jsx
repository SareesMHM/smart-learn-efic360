// src/pages/QuizPlayer.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function QuizPlayer() {
  const { id } = useParams(); // quiz Content _id
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]); // index per question
  const [result, setResult] = useState(null);
  const [startedAt] = useState(new Date().toISOString());

  useEffect(() => {
    axios.get(`/api/materials/${id}`).then(res => {
      setQuiz(res.data);
      setAnswers((res.data?.meta?.questions || []).map(() => -1));
    });
  }, [id]);

  const submit = async () => {
    try {
      const payload = { answers, startedAt };
      const res = await axios.post(`/api/quiz/${id}/attempts`, payload);
      setResult(res.data);
    } catch (e) {
      alert(e?.response?.data?.message || "Submit failed");
    }
  };

  if (!quiz) return <div>Loading…</div>;

  const qs = quiz.meta?.questions || [];

  return (
    <div className="quiz-player">
      <h2>{quiz.title}</h2>
      {qs.map((q, qi) => (
        <div key={qi} className="quiz-q">
          <p><strong>Q{qi + 1}.</strong> {q.question} <span className="muted">({q.points} pts)</span></p>
          {q.options.map((opt, oi) => (
            <label key={oi} style={{ display: "block" }}>
              <input
                type="radio"
                name={`q-${qi}`}
                checked={answers[qi] === oi}
                onChange={() => setAnswers(a => { const n = [...a]; n[qi] = oi; return n; })}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      {!result ? (
        <button className="btn primary" onClick={submit}>Submit</button>
      ) : (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Result</h3>
          <p>Score: {result.score} / {result.maxScore} ({result.percent}%)</p>
          {typeof result.durationSec === "number" && <p>Time: {result.durationSec}s</p>}
        </div>
      )}
    </div>
  );
}
