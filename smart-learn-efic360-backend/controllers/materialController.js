// controllers/materialController.js
const path = require("path");
const fs = require("fs/promises");
const mongoose = require("mongoose");

// Ensure models are registered by requiring the file that defines them
const {Content, Video, Pdf, Assignment, Notes, Links, Quiz } = require("../models/materialModel");


const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

/* ------------ helpers ------------ */
function relFromUploads(absPath) {
  if (!absPath) return undefined;
  // store path relative to /uploads so client can do /uploads/<relPath>
  return path.relative(UPLOAD_ROOT, absPath).replace(/\\/g, "/");
}

function parseMeta(metaStr) {
  if (!metaStr) return {};
  try {
    return JSON.parse(metaStr);
  } catch {
    return {};
  }
}

// Normalize any discriminator doc to a common shape for the frontend
function toClient(doc) {
  const d = doc.toObject ? doc.toObject() : doc;
  const base = {
    _id: d._id,
    title: d.title,
    type: d.type,                // 'video' | 'pdf' | 'assingment' | 'notes' | 'link' | 'quiz'
    description: d.description || "",
    createdAt: d.createdAt,
  };

  switch (d.type) {
    case "video": {
      base.file = d.file || undefined;        // e.g. "videos/<file>"
      base.link = d.url || undefined;
      base.meta = { videoSource: d.source };  // 'upload' | 'url'
      break;
    }
    case "pdf": {
      base.file = d.file || undefined;        // e.g. "docs/<file>"
      break;
    }
    case "assingment": {
      base.file = d.file || undefined;
      base.meta = { dueDate: d.date, maxMarks: d.maxMarks };
      break;
    }
    case "notes": {
      base.meta = { content: d.notes };
      break;
    }
    case "link": {
      base.link = d.url;
      break;
    }
    case "quiz": {
      base.meta = { questions: d.questions || [], totalPoints: d.totalPoints || 0 };
      break;
    }
  }
  return base;
}

/* ------------ controllers ------------ */

// POST /api/materials
// Multer already handled `req.file` if present (at routes level)
async function uploadMaterial(req, res) {
  try {
    const { title, description = "", type } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }
    if (!type) {
      return res.status(400).json({ message: "Type is required." });
    }

    let created;

    // if (type === "video") {
    //   // Accept either upload or URL
    //   const meta = parseMeta(req.body.meta);
    //   const source = meta.videoSource === "url" ? "url" : "upload";

    //   if (source === "url") {
    //     if (!req.body.url && !req.body.link) {
    //       return res.status(400).json({ message: "Video URL is required." });
    //     }
    //     created = await Video.create({
    //       title,
    //       description,
    //       type: "video",
    //       source: "url",
    //       url: req.body.url || req.body.link,
    //     });
    //   } else {
    //     // upload
    //     if (!req.file) {
    //       return res.status(400).json({ message: "Video file is required." });
    //     }
    //     created = await Video.create({
    //       title,
    //       description,
    //       type: "video",
    //       source: "upload",
    //       file: relFromUploads(req.file.path), // e.g. videos/<file>
    //     });
    //   }
    // } 
    // controllers/materialController.js (inside uploadMaterial)
if (type === "video") {
  // Accept file OR url with multiple hints
  const rawMeta = parseMeta(req.body.meta);
  const hint = (req.body.videoSource || rawMeta.videoSource || "").toLowerCase();
  const hasFile = !!req.file;
  const urlField = (req.body.url || req.body.link || "").trim();
  const hasUrl = !!urlField;

  // decide source
  let source;
  if (hint === "upload" || (hasFile && !hasUrl)) source = "upload";
  else if (hint === "url" || (hasUrl && !hasFile)) source = "url";
  else if (hasFile) source = "upload";
  else if (hasUrl) source = "url";

  if (!source) {
    return res.status(400).json({
      message: "Provide a video file or a video URL.",
    });
  }

  if (source === "url") {
    return res.status(201).json(
      toClient(
        await Video.create({
          title,
          description,
          type: "video",
          source: "url",
          url: urlField,
        })
      )
    );
  } else {
    if (!req.file) {
      return res.status(400).json({ message: "Video file is required." });
    }
    return res.status(201).json(
      toClient(
        await Video.create({
          title,
          description,
          type: "video",
          source: "upload",
          file: relFromUploads(req.file.path),
        })
      )
    );
  }
}

    else if (type === "pdf") {
      if (!req.file) return res.status(400).json({ message: "PDF file is required." });
      created = await Pdf.create({
        title,
        description,
        type: "pdf",
        file: relFromUploads(req.file.path), // docs/<file>
      });
    } else if (type === "assingment") {
      // Keep your existing key names: date, maxMarks
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
      const meta = parseMeta(req.body.meta);
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
      const url = req.body.url || req.body.link;
      if (!url) return res.status(400).json({ message: "URL is required." });
      created = await Links.create({
        title,
        description,
        type: "link",
        url,
      });
    } else if (type === "quiz") {
      // Accept questions via meta JSON or raw body
      const meta = parseMeta(req.body.meta);
      const questions = Array.isArray(meta.questions) ? meta.questions : parseMaybeJSON(req.body.questions);
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
    // If Multer saved a file but we fail later, consider cleaning it here if needed.
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

// DELETE /api/materials/:id
async function deleteMaterial(req, res) {
  try {
    const doc = await Content.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    // remove associated file if present (video/pdf/assingment can have `file`)
    if (doc.file) {
      // doc.file is stored relative to /uploads, e.g. "videos/<name>" or "docs/<name>"
      const abs = path.join(UPLOAD_ROOT, doc.file);
      try {
        await fs.unlink(abs);
      } catch {
        // ignore missing file
      }
    }

    await doc.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteMaterial error:", err);
    return res.status(500).json({ message: "Failed to delete material." });
  }
}

/* ---------- small helper for quiz alt payload ---------- */
function parseMaybeJSON(val) {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return undefined; }
}

module.exports = {
  uploadMaterial,
  getMaterials,
  deleteMaterial,
};
