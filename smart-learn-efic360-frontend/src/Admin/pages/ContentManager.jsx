// src/pages/ContentManager.jsx
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

/* ---------------- Helpers ---------------- */
const ACCEPT_BY_TYPE = {
  video: "video/*",
  pdf: "application/pdf",
  assignment: "application/pdf",
  notes: "",
  link: "",
  quiz: "",
  chatbot: "",
};

const initialForm = {
  title: "",
  type: "video", // video | pdf | assignment | notes | link | quiz | chatbot
  description: "",
  file: null,
  link: "",
  meta: {},
};
const emptyQuestion = () => ({ question: "", options: ["", ""], correctIndex: 0, points: 1 });
const emptyFaq = () => ({ q: "", a: "" });

/* ---------------- Page ---------------- */
export default function ContentManager() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [videoSource, setVideoSource] = useState("upload"); // upload | url (only when type=video)
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  /* -------- Load once -------- */
  useEffect(() => { fetchMaterials(); }, []);
  async function fetchMaterials() {
    try {
      const res = await axios.get("/api/materials");
      setMaterials(res.data || []);
    } catch {
      setMessage("⚠️ Failed to load materials.");
    }
  }

  /* -------- Form handlers -------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };
  const setMeta = (updater) =>
    setForm((prev) => ({
      ...prev,
      meta: typeof updater === "function" ? updater(prev.meta || {}) : updater,
    }));

  /* -------- Dynamic meta scaffold -------- */
  useEffect(() => {
    if (form.type === "quiz" && !form.meta?.questions) setMeta({ questions: [emptyQuestion()] });
    else if (form.type === "chatbot" && !form.meta?.faqs) setMeta({ faqs: [emptyFaq()] });
    else if (form.type === "notes" && !form.meta?.content) setMeta({ content: "" });
    else if (form.type === "assignment" && !form.meta?.dueDate) setMeta({ dueDate: "", maxMarks: 100 });

    if (form.type !== "video") setVideoSource("upload");
  }, [form.type]);

  /* -------- Validate minimal requirements -------- */
  function validate() {
    if (!form.title.trim()) return "Title is required.";
    if (form.type === "link" && !form.link) return "Please provide a link URL.";
    if (form.type === "video" && videoSource === "url" && !form.link) return "Please provide a video URL.";
    if (["video", "pdf", "assignment"].includes(form.type) && !editingId && !form.file)
      return "Please choose a file to upload.";
    if (form.type === "notes" && !form.meta?.content?.trim()) return "Notes content cannot be empty.";
    if (form.type === "quiz") {
      const qs = (form.meta?.questions || []).filter((q) => q.question.trim());
      if (!qs.length) return "Add at least one quiz question.";
    }
    if (form.type === "chatbot") {
      const faqs = (form.meta?.faqs || []).filter((f) => f.q.trim() && f.a.trim());
      if (!faqs.length) return "Add at least one FAQ pair.";
    }
    return null;
  }

  /* -------- Submit (create/update) -------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setMessage(`❌ ${err}`);

    setLoading(true);
    setProgress(0);
    setMessage("");

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("type", form.type);
      data.append("description", form.description || "");

      if (form.type === "link") {
        data.append("link", form.link);
      } else if (form.type === "video") {
        if (videoSource === "url") {
          data.append("link", form.link);
          data.append("meta", JSON.stringify({ videoSource: "url" }));
        } else {
          if (form.file) data.append("file", form.file);
          data.append("meta", JSON.stringify({ videoSource: "upload" }));
        }
      } else if (["pdf", "assignment"].includes(form.type)) {
        if (form.file) data.append("file", form.file);
        if (form.type === "assignment") {
          data.append(
            "meta",
            JSON.stringify({
              dueDate: form.meta?.dueDate || "",
              maxMarks: Number(form.meta?.maxMarks ?? 100),
            })
          );
        }
      } else if (form.type === "notes") {
        data.append("meta", JSON.stringify({ content: form.meta.content }));
      } else if (form.type === "quiz") {
        const questions = (form.meta?.questions || []).filter((q) => q.question.trim());
        data.append("meta", JSON.stringify({ questions }));
      } else if (form.type === "chatbot") {
        const faqs = (form.meta?.faqs || []).filter((f) => f.q.trim() && f.a.trim());
        data.append("meta", JSON.stringify({ faqs }));
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      };

      if (editingId) {
        await axios.put(`/api/materials/${editingId}`, data, config);
        setMessage("✅ Material updated.");
      } else {
        await axios.post("/api/materials", data, config);
        setMessage("✅ Material saved.");
      }

      setForm(initialForm);
      setVideoSource("upload");
      setEditingId(null);
      setProgress(0);
      await fetchMaterials();
    } catch (err2) {
      setMessage(err2?.response?.data?.message || `❌ ${err2.message || "Save failed."}`);
    } finally {
      setLoading(false);
    }
  };

  /* -------- Edit / Delete -------- */
  const beginEdit = (mat) => {
    setEditingId(mat._id);
    setForm({
      title: mat.title || "",
      type: mat.type,
      description: mat.description || "",
      file: null, // keep empty unless user chooses a new one
      link: mat.link || "",
      meta: mat.meta || {},
    });
    setVideoSource(mat.meta?.videoSource === "url" ? "url" : "upload");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await axios.delete(`/api/materials/${id}`);
      await fetchMaterials();
    } catch {
      setMessage("Delete failed.");
    }
  };

  /* -------- Search/filter -------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.type?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
    );
  }, [materials, query]);

  /* ---------------- Render ---------------- */
  return (
    <div className="app-shell">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="app-main">
        <div className="content-manager">
          <div className="cm-head">
            <h1>Content Management</h1>
            <div className="cm-actions">
              <input
                className="cm-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, type, description…"
              />
            </div>
          </div>

          {message && <div className="cm-toast">{message}</div>}

          <form className="cm-form" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid">
              <div className="field">
                <label>
                  Title<span className="req">*</span>
                </label>
                <input name="title" value={form.title} onChange={handleChange} required />
              </div>

              <div className="field">
                <label>Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="assignment">Assignment</option>
                  <option value="notes">Notes</option>
                  <option value="link">Link</option>
                  <option value="quiz">Quiz</option>
                  <option value="chatbot">Chatbot (FAQ)</option>
                </select>
              </div>

              <div className="field span-2">
                <label>Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description (optional)"
                />
              </div>
            </div>

            {/* Type-specific UI */}
            {form.type === "video" && (
              <div className="card">
                <div className="toggle">
                  <label>
                    <input
                      type="radio"
                      name="videoSource"
                      value="upload"
                      checked={videoSource === "upload"}
                      onChange={() => setVideoSource("upload")}
                    />
                    Upload file
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="videoSource"
                      value="url"
                      checked={videoSource === "url"}
                      onChange={() => setVideoSource("url")}
                    />
                    Use URL (YouTube, etc.)
                  </label>
                </div>

                {videoSource === "upload" ? (
                  <div className="field">
                    <label>
                      Video File<span className="req">*</span>
                    </label>
                    <input
                      name="file"
                      type="file"
                      accept={ACCEPT_BY_TYPE.video}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <div className="field">
                    <label>
                      Video URL<span className="req">*</span>
                    </label>
                    <input name="link" placeholder="https://…" value={form.link} onChange={handleChange} />
                  </div>
                )}
              </div>
            )}

            {form.type === "pdf" && (
              <div className="field">
                <label>
                  PDF File<span className="req">*</span>
                </label>
                <input
                  name="file"
                  type="file"
                  accept={ACCEPT_BY_TYPE.pdf}
                  onChange={handleChange}
                />
              </div>
            )}

            {form.type === "assignment" && (
              <div className="grid">
                <div className="field">
                  <label>
                    Assignment PDF<span className="req">*</span>
                  </label>
                  <input
                    name="file"
                    type="file"
                    accept={ACCEPT_BY_TYPE.assignment}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={form.meta?.dueDate || ""}
                    onChange={(e) => setMeta({ ...form.meta, dueDate: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Max Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={form.meta?.maxMarks ?? 100}
                    onChange={(e) => setMeta({ ...form.meta, maxMarks: e.target.value })}
                  />
                </div>
              </div>
            )}

            {form.type === "notes" && (
              <div className="field">
                <label>
                  Notes Content<span className="req">*</span>
                </label>
                <textarea
                  rows={6}
                  value={form.meta?.content || ""}
                  onChange={(e) => setMeta({ content: e.target.value })}
                  placeholder="Paste or write your notes here…"
                />
              </div>
            )}

            {form.type === "link" && (
              <div className="field">
                <label>
                  URL<span className="req">*</span>
                </label>
                <input name="link" placeholder="https://…" value={form.link} onChange={handleChange} />
              </div>
            )}

            {form.type === "quiz" && <QuizBuilder meta={form.meta} setMeta={setMeta} />}

            {form.type === "chatbot" && <ChatbotBuilder meta={form.meta} setMeta={setMeta} />}

            {/* Progress */}
            {loading && (
              <div className="progress">
                <div className="bar" style={{ width: `${progress}%` }} />
              </div>
            )}

            <div className="actions">
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? (editingId ? "Updating…" : "Saving…") : editingId ? "Update Material" : "Save Material"}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setForm(initialForm);
                  setVideoSource("upload");
                  setEditingId(null);
                }}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </form>

          {/* -------- List -------- */}
          <h3 className="cm-subtitle">Uploaded Materials</h3>
          {filtered.length === 0 ? (
            <p className="muted">No materials yet.</p>
          ) : (
            <ul className="cm-list">
              {filtered.map((m) => (
                <li key={m._id} className="cm-item">
                  <div className="cm-meta">
                    <div className={`type-badge t-${m.type}`}>{m.type}</div>
                    <h4 className="cm-title">{m.title}</h4>
                    {m.description && <p className="cm-desc">{m.description}</p>}

                    {/* Type-specific summary */}
                    {m.type === "quiz" && <p className="muted">Questions: {m.meta?.questions?.length || 0}</p>}
                    {m.type === "chatbot" && <p className="muted">FAQs: {m.meta?.faqs?.length || 0}</p>}
                    {m.type === "notes" && (
                      <p className="muted">
                        {(m.meta?.content || "").slice(0, 120)}
                        {(m.meta?.content || "").length > 120 ? "…" : ""}
                      </p>
                    )}
                    {m.type === "assignment" && (
                      <p className="muted">
                        Due: {m.meta?.dueDate ? new Date(m.meta.dueDate).toLocaleDateString() : "—"} · Max:{" "}
                        {m.meta?.maxMarks ?? 100}
                      </p>
                    )}
                  </div>

                  <div className="cm-links">
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="btn ghost">
                        Open Link
                      </a>
                    )}
                    {!m.link && m.file && (
                      <a href={`/uploads/${m.file}`} target="_blank" rel="noopener noreferrer" className="btn ghost">
                        View File
                      </a>
                    )}
                    <button className="btn sm" onClick={() => beginEdit(m)}>
                      Edit
                    </button>
                    <button className="btn danger" onClick={() => handleDelete(m._id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* --------------- Quiz Builder --------------- */
function QuizBuilder({ meta, setMeta }) {
  const questions = meta?.questions || [emptyQuestion()];

  const updateQ = (i, patch) => {
    const next = [...questions];
    next[i] = { ...next[i], ...patch };
    setMeta({ questions: next });
  };
  const updateOption = (qi, oi, val) => {
    const next = [...questions];
    const opts = [...next[qi].options];
    opts[oi] = val;
    next[qi] = { ...next[qi], options: opts };
    setMeta({ questions: next });
  };
  const addOption = (qi) => {
    const next = [...questions];
    next[qi] = { ...next[qi], options: [...next[qi].options, ""] };
    setMeta({ questions: next });
  };
  const removeOption = (qi, oi) => {
    const next = [...questions];
    const opts = [...next[qi].options];
    if (opts.length <= 2) return;
    opts.splice(oi, 1);
    next[qi].correctIndex = Math.min(next[qi].correctIndex, opts.length - 1);
    next[qi] = { ...next[qi], options: opts };
    setMeta({ questions: next });
  };
  const addQ = () => setMeta({ questions: [...questions, emptyQuestion()] });
  const removeQ = (i) => setMeta({ questions: questions.filter((_, idx) => idx !== i) });

  return (
    <div className="card">
      <h4>Quiz Builder</h4>
      {questions.map((q, i) => (
        <div key={i} className="quiz-q">
          <div className="grid">
            <div className="field span-2">
              <label>Question {i + 1}</label>
              <input
                value={q.question}
                onChange={(e) => updateQ(i, { question: e.target.value })}
                placeholder="Type your question"
              />
            </div>
            <div className="field">
              <label>Points</label>
              <input
                type="number"
                min="1"
                value={q.points}
                onChange={(e) => updateQ(i, { points: Number(e.target.value || 1) })}
              />
            </div>
          </div>

          <div className="options">
            <label>Options</label>
            {q.options.map((opt, oi) => (
              <div className="option" key={oi}>
                <input value={opt} onChange={(e) => updateOption(i, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                <label className="radio">
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQ(i, { correctIndex: oi })}
                  />
                  Correct
                </label>
                <button type="button" className="btn xs" onClick={() => removeOption(i, oi)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn sm" onClick={() => addOption(i)}>
              + Add option
            </button>
          </div>

          <div className="q-actions">
            <button type="button" className="btn danger sm" onClick={() => removeQ(i)}>
              Delete question
            </button>
          </div>
          <hr />
        </div>
      ))}
      <button type="button" className="btn sm" onClick={addQ}>
        + Add question
      </button>
    </div>
  );
}

/* --------------- Chatbot (FAQ) Builder --------------- */
function ChatbotBuilder({ meta, setMeta }) {
  const faqs = meta?.faqs || [emptyFaq()];

  const update = (i, patch) => {
    const next = [...faqs];
    next[i] = { ...next[i], ...patch };
    setMeta({ faqs: next });
  };
  const add = () => setMeta({ faqs: [...faqs, emptyFaq()] });
  const remove = (i) => setMeta({ faqs: faqs.filter((_, idx) => idx !== i) });

  return (
    <div className="card">
      <h4>Chatbot FAQ Builder</h4>
      {faqs.map((f, i) => (
        <div className="faq" key={i}>
          <div className="field">
            <label>Question</label>
            <input value={f.q} onChange={(e) => update(i, { q: e.target.value })} placeholder="e.g., How to submit Assignment 1?" />
          </div>
          <div className="field">
            <label>Answer</label>
            <textarea rows={3} value={f.a} onChange={(e) => update(i, { a: e.target.value })} placeholder="Write the answer students should see…" />
          </div>
          <div className="q-actions">
            <button type="button" className="btn danger xs" onClick={() => remove(i)}>
              Delete FAQ
            </button>
          </div>
          <hr />
        </div>
      ))}
      <button type="button" className="btn sm" onClick={add}>
        + Add FAQ
      </button>
    </div>
  );
}
