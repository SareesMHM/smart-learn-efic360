// src/pages/AssignmentSubmissions.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function AssignmentSubmissions() {
  const { id } = useParams(); // assignment id
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`/api/assignment/${id}/submissions`).then(res => setRows(res.data || []));
  }, [id]);

  return (
    <div>
      <h2>Submissions</h2>
      <table className="table">
        <thead>
          <tr><th>Student</th><th>File</th><th>Submitted</th><th>Grade</th><th>Feedback</th></tr>
        </thead>
        <tbody>
          {rows.map(s => (
            <tr key={s._id}>
              <td>{s.student?.name || s.student?.email || s.student}</td>
              <td><a href={`/uploads/${s.file}`} target="_blank" rel="noreferrer">Open</a></td>
              <td>{new Date(s.submittedAt || s.createdAt).toLocaleString()}</td>
              <td>{s.grade ?? "-"}</td>
              <td>{s.feedback ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
