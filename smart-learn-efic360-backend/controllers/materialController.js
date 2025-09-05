// controllers/materialController.js
const path = require("path");
const fs = require("fs/promises");

const { Content, Video, Pdf, Assignment, Notes, Links, Quiz } = require("../models/materialModel");
const Notification = require('../models/Notification');

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

/* ------------------------------- URL helpers ------------------------------- */

/** Builds a public URL from a file path that is relative to the /uploads root. */
function makePublicURL(relPath, baseUrl) {
  if (!relPath) return undefined;
  // If it's already an absolute URL, return as-is
  if (/^https?:\/\//i.test(relPath)) return relPath;
  // Ensure no double slashes
  const base = String(baseUrl || "").replace(/\/+$/, "");
  const rel = String(relPath).replace(/^\/+/, "");
  return `${base}/uploads/${rel}`;
}

/** Convert absolute path on disk to relative path under /uploads */
function relFromUploads(absPath) {
  if (!absPath) return undefined;
  return path
    .relative(UPLOAD_ROOT, absPath)
    .replace(/\\/g, "/");
}

/** From a stored value (absolute URL or relative), get the REL path to the file under /uploads */
function relFromStored(stored) {
  if (!stored) return undefined;
  // Absolute URL
  if (/^https?:\/\//i.test(stored)) {
    try {
      const u = new URL(stored);
      // expect pathname like /uploads/docs/xxx.pdf
      return u.pathname.replace(/^\/+uploads\/+/, "");
    } catch {
      return undefined;
    }
  }
  // Relative (with/without leading /uploads)
  return String(stored).replace(/^\/+uploads\/+/, "");
}

async function unlinkIfExists(storedPathOrUrl) {
  const rel = relFromStored(storedPathOrUrl);
  if (!rel) return;
  const abs = path.join(UPLOAD_ROOT, rel);
  try { await fs.unlink(abs); } catch { /* ignore missing */ }
}

function parseJSONSafe(str, fallback = {}) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

function parseMaybeJSON(val) {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return undefined; }
}

/**
 * Normalize any discriminator doc to a common shape for the frontend.
 * If options.absolute === true, convert stored relative file paths to absolute URLs using baseUrl.
 * NOTE: We now store ABSOLUTE URLs in Mongo. makePublicURL() will no-op on absolute values.
 */
function toClient(doc, { absolute = false, baseUrl } = {}) {
  const d = doc?.toObject ? doc.toObject() : doc;

  // Helper to maybe absolutize file paths (idempotent if already absolute)
  const fileOut = (rel) => absolute ? makePublicURL(rel, baseUrl) : rel;

  const base = {
    _id: d._id,
    title: d.title,
    subject: d.subject || "",
    grade: d.grade ?? null,
    type: d.type,
    description: d.description || "",
    createdAt: d.createdAt,
  };

  switch (d.type) {
    case "video":
      base.file = fileOut(d.file);           // absolute already
      base.link = d.url || undefined;        // keep external URL as-is
      base.meta = { videoSource: d.source }; // 'upload' | 'url'
      break;
    case "pdf":
      base.file = fileOut(d.file);           // absolute already
      break;
    case "assignment":
    case "assingment":
      base.type = "assignment"; // normalize for frontend
      base.file = fileOut(d.file);
      base.meta = { dueDate: d.date, maxMarks: d.maxMarks };
      break;
    case "notes":
      base.meta = { content: d.notes };
      break;
    case "link":
      base.link = d.url;
      break;
    case "quiz":
      base.meta = {
        questions: d.questions || [],
        totalPoints: d.totalPoints || 0,
        expiresAt: d.expiresAt || null,
      };
      break;
  }
  return base;
}

/* -------------------------------- controllers ------------------------------- */

// POST /api/materials
async function uploadMaterial(req, res) {
  try {
    const { title, description = "", type } = req.body;
    const subject = (req.body.subject || "").trim();
    const grade = req.body.grade !== undefined && req.body.grade !== "" ? Number(req.body.grade) : undefined;

    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required." });
    if (!type) return res.status(400).json({ message: "Type is required." });
    if (!subject) return res.status(400).json({ message: "Subject is required." });
    if (grade === undefined || Number.isNaN(grade)) return res.status(400).json({ message: "Grade is required." });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let created;

    if (type === "video") {
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

      if (!source) return res.status(400).json({ message: "Provide a video file or a video URL." });

      if (source === "url") {
        created = await Video.create({
          title, description, subject, grade,
          type: "video", source: "url", url: urlField,
        });
      } else {
        if (!req.file) return res.status(400).json({ message: "Video file is required." });
        const rel = relFromUploads(req.file.path);
        created = await Video.create({
          title, description, subject, grade,
          type: "video", source: "upload",
          file: makePublicURL(rel, baseUrl),
        });
      }
    } else if (type === "pdf") {
      if (!req.file) return res.status(400).json({ message: "PDF file is required." });
      const rel = relFromUploads(req.file.path);
      created = await Pdf.create({
        title, description, subject, grade,
        type: "pdf",
        file: makePublicURL(rel, baseUrl),
      });
    } else if (type === "assignment" || type === "assingment") {
      const meta = parseJSONSafe(req.body.meta);
      const dueDate = meta.dueDate || req.body.dueDate || req.body.date;
      const maxMarks = meta.maxMarks ?? req.body.maxMarks;

      if (!req.file) return res.status(400).json({ message: "Assignment file is required." });
      if (!dueDate) return res.status(400).json({ message: "Assignment due date is required." });

      const rel = relFromUploads(req.file.path);
      created = await Assignment.create({
        title, description, subject, grade,
        type: "assingment",
        file: makePublicURL(rel, baseUrl),
        date: new Date(dueDate),
        maxMarks: Number(maxMarks ?? 100),
      });
    } else if (type === "notes") {
      const meta = parseJSONSafe(req.body.meta);
      const notes = req.body.notes || meta.content;
      if (!notes || !String(notes).trim()) {
        return res.status(400).json({ message: "Notes content is required." });
      }
      created = await Notes.create({
        title, description, subject, grade,
        type: "notes",
        notes,
      });
    } else if (type === "link") {
      const url = (req.body.url || req.body.link || "").trim();
      if (!url) return res.status(400).json({ message: "URL is required." });
      created = await Links.create({
        title, description, subject, grade,
        type: "link",
        url,
      });
    } else if (type === "quiz") {
      const meta = parseJSONSafe(req.body.meta);
      const questions = Array.isArray(meta.questions)
        ? meta.questions
        : parseMaybeJSON(req.body.questions);
      const expiresAt = meta.expiresAt || req.body.expiresAt || null;

      if (!questions || !questions.length) {
        return res.status(400).json({ message: "At least one quiz question is required." });
      }

      const totalPoints = questions.reduce((s, q) => s + (Number(q.points || 0) || 0), 0);

      created = await Quiz.create({
        title, description, subject, grade,
        type: "quiz",
        questions,
        totalPoints,
        ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
      });
    } else {
      return res.status(400).json({ message: `Unsupported type: ${type}` });
    }

    /* === NEW: create a broadcast notification for this grade/subject === */
    try {
      await Notification.create({
        grade,
        subject,
        materialId: created._id,
        title: `New ${String(created.type).toUpperCase()}: ${title}`,
        message: description || '',
        type: created.type,
        link: `/dashboard/materials/${created._id}`,
        createdBy: req.user?._id,
      });
    } catch (nerr) {
      console.error('create material notification error:', nerr);
      // do not block the main response
    }
    /* === END NEW === */

    const responseBase = `${req.protocol}://${req.get("host")}`;
    return res.status(201).json(toClient(created, { absolute: true, baseUrl: responseBase }));
  } catch (err) {
    console.error("uploadMaterial error:", err);
    return res.status(500).json({ message: "Failed to save material.", error: err.message });
  }
}


// GET /api/materials
async function getMaterials(req, res) {
  try {
    const items = await Content.find().sort({ createdAt: -1 }).lean();
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const normalized = items.map(d => toClient(d, { absolute: true, baseUrl }));
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
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.json(toClient(doc, { absolute: true, baseUrl }));
  } catch (err) {
    console.error("getMaterialById error:", err);
    return res.status(500).json({ message: "Failed to fetch material." });
  }
}

// PUT /api/materials/:id
// Supports replacing file for video/pdf/assignment
async function updateMaterial(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const doc = await Content.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Common fields
    if (title !== undefined) doc.title = title;
    if (description !== undefined) doc.description = description;

    // Allow updating subject/grade
    if (req.body.subject !== undefined) doc.subject = String(req.body.subject || "").trim();
    if (req.body.grade !== undefined && req.body.grade !== "") doc.grade = Number(req.body.grade);

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
        await unlinkIfExists(doc.file);
        const rel = relFromUploads(req.file.path);
        doc.source = "upload";
        // STORE ABSOLUTE
        doc.file = makePublicURL(rel, baseUrl);
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
        const rel = relFromUploads(req.file.path);
        // STORE ABSOLUTE
        doc.file = makePublicURL(rel, baseUrl);
      }
    } else if (doc.type === "assingment" || doc.type === "assignment") {
      const meta = parseJSONSafe(req.body.meta);
      const dueDate = meta.dueDate || req.body.dueDate || req.body.date;
      const maxMarks = meta.maxMarks ?? req.body.maxMarks;

      if (req.file) {
        await unlinkIfExists(doc.file);
        const rel = relFromUploads(req.file.path);
        // STORE ABSOLUTE
        doc.file = makePublicURL(rel, baseUrl);
      }
      if (dueDate !== undefined) doc.date = new Date(dueDate);
      if (maxMarks !== undefined) doc.maxMarks = Number(maxMarks);
      doc.type = "assingment"; // keep discriminator consistent
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

      if (questions) {
        doc.questions = questions;
        // keep totalPoints in sync
        doc.totalPoints = questions.reduce((s, q) => s + (Number(q.points || 0) || 0), 0);
      }

      const expiresAt = meta.expiresAt || req.body.expiresAt;
      if (expiresAt !== undefined) {
        doc.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
      }
    }

    await doc.save();

    const responseBase = `${req.protocol}://${req.get("host")}`;
    return res.json(toClient(doc, { absolute: true, baseUrl: responseBase }));
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
      await unlinkIfExists(doc.file); // works for absolute or relative
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
