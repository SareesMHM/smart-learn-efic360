// src/pages/StudentLibrary.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function StudentLibrary() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("/api/materials") // or a student-specific endpoint if you add one
      .then(res => setItems(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="library">
      <h2>Course Materials</h2>
      <ul className="cm-list">
        {items.map(m => (
          <li key={m._id} className="cm-item">
            <div className={`type-badge t-${m.type}`}>{m.type}</div>
            <h4>{m.title}</h4>
            {m.description && <p className="muted">{m.description}</p>}

            <div className="cm-links">
              {m.type === "video" && (m.link
                ? <a className="btn ghost" href={m.link} target="_blank" rel="noreferrer">Watch</a>
                : <video controls width="360" src={`/uploads/${m.file}`} />)}
              {m.type === "pdf" && <a className="btn ghost" href={`/uploads/${m.file}`} target="_blank" rel="noreferrer">Open PDF</a>}
              {m.type === "notes" && <Link className="btn ghost" to={`/student/material/${m._id}`}>Read</Link>}
              {m.type === "link" && <a className="btn ghost" href={m.link} target="_blank" rel="noreferrer">Open Link</a>}
              {m.type === "assignment" && <AssignmentSubmitButton assignment={m} />}
              {m.type === "quiz" && <Link className="btn primary" to={`/student/quiz/${m._id}`}>Take Quiz</Link>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AssignmentSubmitButton({ assignment }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    if (!file) return setMsg("Choose a file first.");
    const fd = new FormData();
    fd.append("file", file);
    try {
      await axios.post(`/api/assignment/${assignment._id}/submit`, fd);
      setMsg("✅ Submitted");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to submit");
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="btn" onClick={submit}>Submit Assignment</button>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
