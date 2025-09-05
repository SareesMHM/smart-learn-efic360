// models/chatSessionModel.js
const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    sender: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema(
  {
    userId: { type: String },
    sessionId: { type: String, index: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = model("ChatSession", ChatSessionSchema);
