// src/pages/QuizResults.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function QuizResults() {
  const { id } = useParams(); // quiz id
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`/api/quiz/${id}/attempts`).then(res => setRows(res.data || []));
  }, [id]);

  return (
    <div className="results">
      <h2>Quiz Attempts</h2>
      <table className="table">
        <thead>
          <tr><th>Student</th><th>Score</th><th>%</th><th>Submitted</th><th>Time (s)</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id}>
              <td>{r.student?.name || r.student?.email || r.student}</td>
              <td>{r.score} / {r.maxScore}</td>
              <td>{r.percent}</td>
              <td>{new Date(r.submittedAt || r.createdAt).toLocaleString()}</td>
              <td>{r.durationSec ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
