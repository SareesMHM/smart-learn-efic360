// controllers/materialController.js
const asyncHandler = require('express-async-handler');
const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

// @desc    Upload new material
// @route   POST /api/materials
const uploadMaterial = asyncHandler(async (req, res) => {
  const { title, type, description, link } = req.body;
  if (!title || !type) return res.status(400).json({ message: 'Title and type are required.' });

  const material = new Material({
    title,
    type,
    description,
    link: type === 'link' ? link : undefined,
    file: req.file ? req.file.filename : undefined
  });

  await material.save();
  res.status(201).json(material);
});

// @desc    Get all materials
// @route   GET /api/materials
const getMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find().sort({ uploadedAt: -1 });
  res.status(200).json(materials);
});

// @desc    Delete a material
// @route   DELETE /api/materials/:id
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: 'Material not found' });

  if (material.file) {
    const filePath = path.join(__dirname, '../uploads', material.file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await material.deleteOne();
  res.status(200).json({ message: 'Material deleted' });
});

module.exports = {
  uploadMaterial,
  getMaterials,
  deleteMaterial
};
