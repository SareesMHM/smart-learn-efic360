// models/AccessLog.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const AccessLogSchema = new Schema(
  {
    // Not required → lets you log failed attempts before user is known
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },

    // Not required → role might be unknown when login fails
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "parent"],
      index: true,
    },

    ip: { type: String, index: true },
    userAgent: String,

    action: {
      type: String,
      enum: ["login", "logout"],
      required: true,
      index: true,
    },

    // Used by stats/suspicious; set true/false on login attempts
    success: { type: Boolean },

    // Extra info (e.g., { emailTried } for failures)
    meta: Schema.Types.Mixed,

    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

// Helpful indexes
AccessLogSchema.index({ timestamp: -1, action: 1 });

module.exports = mongoose.model("AccessLog", AccessLogSchema);
