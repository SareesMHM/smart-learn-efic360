// models/AssignmentSubmission.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* -------- File subdocument (multer-aligned) -------- */
const FileSchema = new Schema(
  {
    path: { type: String, required: true },          // relative to /uploads, e.g. "submissions/1712345_report.pdf"
    originalName: { type: String, required: true },  // client filename
    size: Number,                                    // bytes
    mimetype: String,                                // e.g. "application/pdf"
  },
  { _id: false }
);

/* -------------------- Main schema ------------------- */
const AssignmentSubmissionSchema = new Schema(
  {
    // Links
    assignment: { type: Schema.Types.ObjectId, ref: "Content", required: true }, // Content.type === 'assignment'
    student:    { type: Schema.Types.ObjectId, ref: "User",    required: true },

    // Payload
    files: { type: [FileSchema], default: [] },  // supports multi-file
    links: { type: [String], default: [] },      // external URLs if needed
    note:  { type: String, default: "" },

    submittedAt: { type: Date, default: Date.now },

    // Workflow
    status: {
      type: String,
      enum: ["draft", "submitted", "returned", "graded"],
      default: "submitted",
      index: true,
    },
    dueDate: { type: Date },
    isLate:  { type: Boolean, default: false },

    // Grading
    grade:    { type: Number },
    maxMarks: { type: Number, default: 100 },
    feedback: { type: String, default: "" },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
    gradedAt: { type: Date },

    // Optional mirrors (fast filters)
    subject:    { type: String },
    gradeLevel: { type: Number },
  },
  { timestamps: true }
);

/* ------------- Virtuals (back-compat helper) ------------- */
// Legacy single-file access: doc.file -> first file path; setting doc.file updates files[0]
AssignmentSubmissionSchema.virtual("file")
  .get(function () {
    return this.files?.[0]?.path;
  })
  .set(function (val) {
    if (!val) { this.files = []; return; }
    const name = String(val).split("/").pop();
    if (!Array.isArray(this.files) || this.files.length === 0) {
      this.files = [{ path: String(val), originalName: name }];
    } else {
      this.files[0].path = String(val);
      if (!this.files[0].originalName) this.files[0].originalName = name;
    }
  });

/* ---------------------- Hooks ---------------------- */
AssignmentSubmissionSchema.pre("save", function (next) {
  if (this.submittedAt && this.dueDate) {
    this.isLate = this.submittedAt > this.dueDate;
  }
  if (this.isModified("status") && this.status === "graded" && !this.gradedAt) {
    this.gradedAt = new Date();
  }
  next();
});

/* ---------------------- Indexes -------------------- */
AssignmentSubmissionSchema.index({ assignment: 1, student: 1, createdAt: -1 });
AssignmentSubmissionSchema.index({ status: 1, createdAt: -1 });
AssignmentSubmissionSchema.index({ subject: 1, gradeLevel: 1, status: 1 });

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
