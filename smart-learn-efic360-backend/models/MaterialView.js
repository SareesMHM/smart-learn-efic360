// models/MaterialView.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MaterialViewSchema = new Schema(
  {
    material: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaterialView", MaterialViewSchema);
