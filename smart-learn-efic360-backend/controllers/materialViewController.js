// controllers/materialViewController.js
const MaterialView = require("../models/MaterialView");
exports.track = async (req, res) => {
  try {
    const { materialId } = req.body;
    await MaterialView.create({ material: materialId, user: req.user._id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "Failed to track view" });
  }
};
