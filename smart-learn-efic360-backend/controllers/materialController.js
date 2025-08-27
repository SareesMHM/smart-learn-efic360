// controllers/materialController.js
const path = require("path");
const fs = require("fs/promises");

// Load discriminated models
const { Content, Video, Pdf, Assignment, Notes, Links, Quiz } = require("../models/materialModel");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

/* --------------------------------- helpers --------------------------------- */
function relFromUploads(absPath) {
  if (!absPath) return undefined;
  return path.relative(UPLOAD_ROOT, absPath).replace(/\\/g, "/");
}

function parseJSONSafe(str, fallback = {}) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function parseMaybeJSON(val) {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return undefined; }
}

async function unlinkIfExists(relPath) {
  if (!relPath) return;
  const abs = path.join(UPLOAD_ROOT, relPath);
  try { await fs.unlink(abs); } catch { /* ignore missing */ }
}

/** Normalize any discriminator doc to a common shape for the frontend */
function toClient(doc) {
  const d = doc?.toObject ? doc.toObject() : doc;
  const base = {
    _id: d._id,
    title: d.title,
    type: d.type, // 'video' | 'pdf' | 'assingment' | 'notes' | 'link' | 'quiz'
    description: d.description || "",
    createdAt: d.createdAt,
  };

  switch (d.type) {
    case "video":
      base.file = d.file || undefined;       // videos/<file>
      base.link = d.url || undefined;
      base.meta = { videoSource: d.source }; // 'upload' | 'url'
      break;
    case "pdf":
      base.file = d.file || undefined;       // docs/<file>
      break;
    case "assingment":
      base.file = d.file || undefined;
      base.meta = { dueDate: d.date, maxMarks: d.maxMarks };
      break;
    case "notes":
      base.meta = { content: d.notes };
      break;
    case "link":
      base.link = d.url;
      break;
    case "quiz":
      base.meta = { questions: d.questions || [], totalPoints: d.totalPoints || 0 };
      break;
  }
  return base;
}

/* -------------------------------- controllers ------------------------------- */

// POST /api/materials
// Multer already handled `req.file` if present (at routes level)
async function uploadMaterial(req, res) {
  try {
    const { title, description = "", type } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required." });
    if (!type) return res.status(400).json({ message: "Type is required." });

    let created;

    if (type === "video") {
      // Accept file OR url with multiple hints
      const rawMeta = parseJSONSafe(req.body.meta);
      const hint = (req.body.videoSource || rawMeta.videoSource || "").toLowerCase();
      const hasFile = !!req.file;
      const urlField = (req.body.url || req.body.link || "").trim();
      const hasUrl = !!urlField;

      let source;
      if (hint === "upload" || (hasFile && !hasUrl)) source = "upload";
      else if (hint === "url" || (hasUrl && !hasFile)) source = "url";
      else if (hasFile) source = "upload";
      else if (hasUrl) source = "url";

      if (!source) {
        return res.status(400).json({ message: "Provide a video file or a video URL." });
      }

      if (source === "url") {
        created = await Video.create({
          title,
          description,
          type: "video",
          source: "url",
          url: urlField,
        });
      } else {
        if (!req.file) return res.status(400).json({ message: "Video file is required." });
        created = await Video.create({
          title,
          description,
          type: "video",
          source: "upload",
          file: relFromUploads(req.file.path),
        });
      }
    } else if (type === "pdf") {
      if (!req.file) return res.status(400).json({ message: "PDF file is required." });
      created = await Pdf.create({
        title,
        description,
        type: "pdf",
        file: relFromUploads(req.file.path),
      });
    } else if (type === "assingment") { // keep the existing key to match your model
      const { date, maxMarks } = req.body;
      if (!req.file) return res.status(400).json({ message: "Assignment file is required." });
      if (!date) return res.status(400).json({ message: "Assignment date is required." });

      created = await Assignment.create({
        title,
        description,
        type: "assingment",
        file: relFromUploads(req.file.path),
        date: new Date(date),
        maxMarks: Number(maxMarks ?? 100),
      });
    } else if (type === "notes") {
      const meta = parseJSONSafe(req.body.meta);
      const notes = req.body.notes || meta.content;
      if (!notes || !String(notes).trim()) {
        return res.status(400).json({ message: "Notes content is required." });
      }
      created = await Notes.create({
        title,
        description,
        type: "notes",
        notes,
      });
    } else if (type === "link") {
      const url = (req.body.url || req.body.link || "").trim();
      if (!url) return res.status(400).json({ message: "URL is required." });
      created = await Links.create({
        title,
        description,
        type: "link",
        url,
      });
    } else if (type === "quiz") {
      const meta = parseJSONSafe(req.body.meta);
      const questions = Array.isArray(meta.questions)
        ? meta.questions
        : parseMaybeJSON(req.body.questions);
      if (!questions || !questions.length) {
        return res.status(400).json({ message: "At least one quiz question is required." });
      }
      created = await Quiz.create({
        title,
        description,
        type: "quiz",
        questions,
      });
    } else {
      return res.status(400).json({ message: `Unsupported type: ${type}` });
    }

    return res.status(201).json(toClient(created));
  } catch (err) {
    console.error("uploadMaterial error:", err);
    return res.status(500).json({ message: "Failed to save material.", error: err.message });
  }
}

// GET /api/materials
async function getMaterials(_req, res) {
  try {
    const items = await Content.find().sort({ createdAt: -1 }).lean();
    const normalized = items.map(toClient);
    return res.json(normalized);
  } catch (err) {
    console.error("getMaterials error:", err);
    return res.status(500).json({ message: "Failed to fetch materials." });
  }
}

// GET /api/materials/:id
async function getMaterialById(req, res) {
  try {
    const doc = await Content.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(toClient(doc));
  } catch (err) {
    console.error("getMaterialById error:", err);
    return res.status(500).json({ message: "Failed to fetch material." });
  }
}

// PUT /api/materials/:id
// Supports replacing file for video/pdf/assingment
async function updateMaterial(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type } = req.body; // type should match existing (optional to pass)

    const doc = await Content.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    // Common fields
    if (title !== undefined) doc.title = title;
    if (description !== undefined) doc.description = description;

    // Type-specific updates
    if (doc.type === "video") {
      const meta = parseJSONSafe(req.body.meta);
      const hint = (req.body.videoSource || meta.videoSource || "").toLowerCase();
      const hasFile = !!req.file;
      const urlField = (req.body.url || req.body.link || "").trim();
      const hasUrl = !!urlField;

      let source;
      if (hint === "upload" || (hasFile && !hasUrl)) source = "upload";
      else if (hint === "url" || (hasUrl && !hasFile)) source = "url";
      else if (hasFile) source = "upload";
      else if (hasUrl) source = "url";

      if (source === "upload") {
        if (!req.file) return res.status(400).json({ message: "Video file is required." });
        // remove old file if existed
        await unlinkIfExists(doc.file);
        doc.source = "upload";
        doc.file = relFromUploads(req.file.path);
        doc.url = undefined;
      } else if (source === "url") {
        if (!urlField) return res.status(400).json({ message: "Video URL is required." });
        await unlinkIfExists(doc.file);
        doc.source = "url";
        doc.url = urlField;
        doc.file = undefined;
      }
    } else if (doc.type === "pdf") {
      if (req.file) {
        await unlinkIfExists(doc.file);
        doc.file = relFromUploads(req.file.path);
      }
    } else if (doc.type === "assingment") {
      const { date, maxMarks } = req.body;
      if (req.file) {
        await unlinkIfExists(doc.file);
        doc.file = relFromUploads(req.file.path);
      }
      if (date !== undefined) doc.date = new Date(date);
      if (maxMarks !== undefined) doc.maxMarks = Number(maxMarks);
    } else if (doc.type === "notes") {
      const meta = parseJSONSafe(req.body.meta);
      const notes = req.body.notes ?? meta.content;
      if (notes !== undefined) doc.notes = notes;
    } else if (doc.type === "link") {
      const url = (req.body.url || req.body.link || "").trim();
      if (url) doc.url = url;
    } else if (doc.type === "quiz") {
      const meta = parseJSONSafe(req.body.meta);
      const questions = Array.isArray(meta.questions)
        ? meta.questions
        : parseMaybeJSON(req.body.questions);
      if (questions) doc.questions = questions;
      if (req.body.totalPoints !== undefined) doc.totalPoints = Number(req.body.totalPoints);
    }

    await doc.save();
    return res.json(toClient(doc));
  } catch (err) {
    console.error("updateMaterial error:", err);
    return res.status(500).json({ message: "Failed to update material.", error: err.message });
  }
}

// DELETE /api/materials/:id
async function deleteMaterial(req, res) {
  try {
    const doc = await Content.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (doc.file) {
      await unlinkIfExists(doc.file);
    }

    await doc.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteMaterial error:", err);
    return res.status(500).json({ message: "Failed to delete material." });
  }
}

module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};
