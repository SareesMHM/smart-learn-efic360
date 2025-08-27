// controllers/assignmentController.js
const path = require("path");
const fs = require("fs/promises");
const { Assignment } = require("../models/materialModel");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
async function unlinkIfExists(relPath) {
  if (!relPath) return;
  const abs = path.join(UPLOAD_ROOT, relPath);
  try { await fs.unlink(abs); } catch {}
}

// Create
async function createAssignment(req, res) {
  try {
    const { title, description = "", date, maxMarks = 100 } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required." });
    if (!date) return res.status(400).json({ message: "Assignment date is required." });
    if (!req.file) return res.status(400).json({ message: "Assignment file is required." });

    const rel = req.file.path.replace(path.join(__dirname, "..", "uploads") + path.sep, "")
                             .replace(/\\/g, "/");

    const doc = await Assignment.create({
      title,
      description,
      type: "assingment",          // keep your existing spelling to match the model
      file: rel,
      date: new Date(date),
      maxMarks: Number(maxMarks),
    });
    res.status(201).json(doc);
  } catch (e) {
    console.error("createAssignment error:", e);
    res.status(500).json({ message: "Failed to create assignment.", error: e.message });
  }
}

// List
async function listAssignments(_req, res) {
  try {
    const items = await Assignment.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    console.error("listAssignments error:", e);
    res.status(500).json({ message: "Failed to fetch assignments." });
  }
}

// Get one
async function getAssignmentById(req, res) {
  try {
    const doc = await Assignment.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    console.error("getAssignmentById error:", e);
    res.status(500).json({ message: "Failed to fetch assignment." });
  }
}

// Update (supports file replace)
async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { title, description, date, maxMarks } = req.body;

    const doc = await Assignment.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (title !== undefined) doc.title = title;
    if (description !== undefined) doc.description = description;
    if (date !== undefined) doc.date = new Date(date);
    if (maxMarks !== undefined) doc.maxMarks = Number(maxMarks);

    if (req.file) {
      if (doc.file) await unlinkIfExists(doc.file);
      const rel = req.file.path.replace(path.join(__dirname, "..", "uploads") + path.sep, "")
                               .replace(/\\/g, "/");
      doc.file = rel;
    }

    await doc.save();
    res.json(doc);
  } catch (e) {
    console.error("updateAssignment error:", e);
    res.status(500).json({ message: "Failed to update assignment.", error: e.message });
  }
}

// Delete
async function deleteAssignment(req, res) {
  try {
    const doc = await Assignment.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.file) await unlinkIfExists(doc.file);
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    console.error("deleteAssignment error:", e);
    res.status(500).json({ message: "Failed to delete assignment." });
  }
}

module.exports = {
  createAssignment,
  listAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};
