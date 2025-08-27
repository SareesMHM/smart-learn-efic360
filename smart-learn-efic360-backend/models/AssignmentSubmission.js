const mongoose = require("mongoose");
const { Schema } = mongoose;

const AssignmentSubmissionSchema = new Schema(
  {
    assignment: { type: Schema.Types.ObjectId, ref: "Content", required: true }, // type='assingment'
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    file: { type: String, required: true }, // relative to /uploads
    note: String,
    submittedAt: { type: Date, default: Date.now },
    grade: Number,            // teacher fills later
    feedback: String,         // teacher fills later
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
