const Material = require("../models/materialModel");
const { deleteFileIfExists } = require("../utils/fs.util");

async function listMaterials({ q, type, page = 1, limit = 25 }) {
  const filter = {};
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [{ title: regex }, { description: regex }, { type: regex }];
  }
  if (type) filter.type = type;

  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));
  const [items, total] = await Promise.all([
    Material.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Material.countDocuments(filter),
  ]);

  return { items, total, page: Number(page), pages: Math.ceil(total / limit || 1) };
}

async function createMaterial(doc) {
  const created = await Material.create(doc);
  return created.toObject();
}

async function getMaterialById(id) {
  return Material.findById(id);
}

async function updateMaterial(existing, patch) {
  const oldFile = existing.file;
  const newFile = patch.file; // filename or undefined

  existing.title = patch.title ?? existing.title;
  existing.type = patch.type ?? existing.type;
  existing.description = patch.description ?? existing.description;
  existing.link = patch.link ?? existing.link;
  if (newFile) existing.file = newFile;

  if (patch.meta && Object.keys(patch.meta).length) {
    existing.meta = patch.meta; // replace; adjust to merge if needed
  }

  const saved = await existing.save();

  // remove old file if replaced
  if (newFile && oldFile && oldFile !== newFile) {
    await deleteFileIfExists(oldFile);
  }

  return saved.toObject();
}

async function deleteMaterial(existing) {
  const file = existing.file;
  await existing.deleteOne();
  if (file) await deleteFileIfExists(file);
  return { ok: true };
}

module.exports = {
  listMaterials,
  createMaterial,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};
