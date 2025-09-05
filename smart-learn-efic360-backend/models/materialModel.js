// models/content.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ---------- Constants ---------- */
const SUBJECTS = ["English", "Maths", "Tamil", "Science", "History", "IT"];
const GRADES = [6, 7, 8, 9, 10, 11];

/* ---------- Base Content ---------- */
const ContentSchema = new Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: "" },

    // NEW: cohort targeting
    subject:      { type: String, enum: SUBJECTS, required: true },
    grade:        { type: Number, enum: GRADES, required: true },

    createdAt:    { type: Date, default: Date.now },
  },
  {
    discriminatorKey: "type",
    collection: "contents",
    // timestamps: true, // enable if you want updatedAt as well
  }
);

// Helpful indexes (lists & filtering)
ContentSchema.index({ subject: 1, grade: 1, type: 1, createdAt: -1 });

// Register base
const Content = mongoose.model("Content", ContentSchema);

/* ---------- Video ---------- */
const VideoSchema = new Schema({
  source: { type: String, enum: ["upload", "url"], required: true },
  file:   { type: String, trim: true }, // when source=upload
  url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/i, "Video URL must start with http(s)://"],
  }, // when source=url
});
const Video = Content.discriminator("Video", VideoSchema, "video");

/* ---------- PDF ---------- */
const PdfSchema = new Schema({
  file: { type: String, trim: true, required: true },
});
const Pdf = Content.discriminator("Pdf", PdfSchema, "pdf");

/* ---------- Assingment (legacy spelling preserved) ---------- */
const AssingmentSchema = new Schema({
  file:     { type: String, trim: true, required: true },
  date:     { type: Date, required: true },   // due date
  maxMarks: { type: Number, required: true },
});
const Assignment = Content.discriminator("Assingment", AssingmentSchema, "assingment");

/* ---------- Notes ---------- */
const NotesSchema = new Schema({
  notes: { type: String, required: true },
});
const Notes = Content.discriminator("Notes", NotesSchema, "notes");

/* ---------- Link ---------- */
const LinkSchema = new Schema({
  url: { type: String, required: true, trim: true },
});
const Links = Content.discriminator("Links", LinkSchema, "link");

/* ---------- Quiz (MCQ) ---------- */
const QuestionSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.filter(Boolean).length >= 2,
        message: "Provide at least two non-empty options.",
      },
    },
    correctIndex: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v >= 0 && v < (this.options?.length || 0);
        },
        message: "correctIndex must reference an existing option.",
      },
    },
    points: { type: Number, min: 1, default: 1 },
  },
  { _id: false }
);

QuestionSchema.pre("validate", function (next) {
  this.options = (this.options || []).map((s) => (s || "").trim()).filter(Boolean);
  if (this.options.length < 2) return next(new Error("Provide at least two non-empty options."));
  if (!Number.isInteger(this.correctIndex) || this.correctIndex < 0 || this.correctIndex >= this.options.length) {
    this.correctIndex = 0;
  }
  next();
});

const QuizSchema = new Schema(
  {
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Quiz must have at least one question.",
      },
    },
    totalPoints: { type: Number, default: 0 },

    // NEW: enforce expiry in controllers/submit
    expiresAt: { type: Date, default: null },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

QuizSchema.pre("validate", function (next) {
  this.totalPoints = (this.questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  next();
});

// Index to quickly find active/expired quizzes by cohort
QuizSchema.index?.({ expiresAt: 1 }); // will exist on the sub-schema's collection via discriminator parent

const Quiz = Content.discriminator("Quiz", QuizSchema, "quiz");

module.exports = { Content, Video, Pdf, Assignment, Notes, Links, Quiz, SUBJECTS, GRADES };
