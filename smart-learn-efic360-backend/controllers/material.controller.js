const {
  listMaterials,
  createMaterial,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require("../services/material.service");
const { parseMeta, validateCreateOrUpdate } = require("../validators/material.validator");
const { deleteFileIfExists } = require("../utils/fs.util");

// GET /api/materials?q=&type=&page=&limit=
async function index(req, res, next) {
  try {
    const { q, type, page = 1, limit = 25 } = req.query;
    const data = await listMaterials({ q, type, page, limit });
    res.json(data);
  } catch (e) { next(e); }
}

// POST /api/materials
async function create(req, res, next) {
  const file = req.file?.filename;
  try {
    const err = validateCreateOrUpdate(req.body, !!file, false);
    if (err) {
      if (file) await deleteFileIfExists(file);
      return res.status(400).json({ message: err });
    }

    const doc = await createMaterial({
      title: req.body.title,
      type: req.body.type,
      description: req.body.description || "",
      file: file || undefined,
      link: req.body.link || undefined,
      meta: parseMeta(req.body.meta),
    });

    res.status(201).json(doc);
  } catch (e) {
    if (file) await deleteFileIfExists(file);
    next(e);
  }
}

// PUT /api/materials/:id
async function update(req, res, next) {
  const incomingFile = req.file?.filename;
  try {
    const existing = await getMaterialById(req.params.id);
    if (!existing) {
      if (incomingFile) await deleteFileIfExists(incomingFile);
      return res.status(404).json({ message: "Not found" });
    }

    const err = validateCreateOrUpdate(
      req.body,
      !!incomingFile,
      !!existing.file
    );
    if (err) {
      if (incomingFile) await deleteFileIfExists(incomingFile);
      return res.status(400).json({ message: err });
    }

    const saved = await updateMaterial(existing, {
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
      file: incomingFile, // optional
      link: req.body.link,
      meta: parseMeta(req.body.meta),
    });

    res.json(saved);
  } catch (e) {
    if (incomingFile) await deleteFileIfExists(incomingFile);
    next(e);
  }
}

// DELETE /api/materials/:id
async function destroy(req, res, next) {
  try {
    const existing = await getMaterialById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    const result = await deleteMaterial(existing);
    res.json(result);
  } catch (e) { next(e); }
}

module.exports = { index, create, update, destroy };
