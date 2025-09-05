// models/Material.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

/* -------- Masters (keep in sync with frontend) -------- */
const SUBJECTS = ["English", "Maths", "Tamil", "Science", "History", "IT"];
const GRADES = [6, 7, 8, 9, 10, 11];

/* -------- Sub-schemas -------- */
const QuestionSchema = new Schema({
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
}, { _id: false });

QuestionSchema.pre("validate", function (next) {
  this.options = (this.options || []).map((s) => (s || "").trim()).filter(Boolean);
  if (this.options.length < 2) return next(new Error("Provide at least two non-empty options."));
  if (!Number.isInteger(this.correctIndex) || this.correctIndex < 0 || this.correctIndex >= this.options.length) {
    this.correctIndex = 0;
  }
  next();
});

const FaqSchema = new Schema({
  q: { type: String, required: true, trim: true },
  a: { type: String, required: true, trim: true },
}, { _id: false });

/* -------- Main schema -------- */
const MaterialSchema = new Schema({
  title: { type: String, required: true, trim: true },

  // NEW: cohort fields
  subject: { type: String, enum: SUBJECTS, required: true },
  grade: { type: Number, enum: GRADES, required: true },

  type: {
    type: String,
    enum: ['video', 'pdf', 'assignment', 'notes', 'link', 'quiz', 'chatbot'],
    required: true,
  },

  description: { type: String, default: '' },

  // Common fields
  file: { type: String }, // filename under /uploads (for video/pdf/assignment when uploaded)
  link: {
    type: String,
    trim: true,
    // only used for type='link' OR video via URL
    match: [/^https?:\/\/.+/i, "Link must start with http(s)://"],
  },

  // Per-type meta (superset; validated conditionally below)
  meta: {
    videoSource: { type: String, enum: ['upload', 'url'] }, // for type='video'
    // assignment
    dueDate: { type: Date },
    maxMarks: { type: Number, default: 100 },
    // notes
    content: { type: String },
    // quiz
    questions: { type: [QuestionSchema], default: undefined },
    expiresAt: { type: Date },
    // chatbot
    faqs: { type: [FaqSchema], default: undefined },
  },

  uploadedAt: { type: Date, default: Date.now }, // keep for compatibility
}, { timestamps: true });

/* -------- Indexes -------- */
MaterialSchema.index({ subject: 1, grade: 1, type: 1, uploadedAt: -1 });

/* -------- Conditional validation by type -------- */
MaterialSchema.pre('validate', function (next) {
  const t = this.type;

  // video: require either file (upload) or link (url) and set/validate videoSource
  if (t === 'video') {
    const source = (this.meta?.videoSource || '').toLowerCase();
    if (source === 'url') {
      if (!this.link) return next(new Error('Video URL is required for videoSource=url.'));
      this.file = this.file || undefined; // ignore file if url
    } else if (source === 'upload') {
      if (!this.file) return next(new Error('Video file is required for videoSource=upload.'));
      this.link = this.link || undefined; // ignore link if upload
    } else {
      return next(new Error('meta.videoSource must be "upload" or "url" for videos.'));
    }
  }

  // pdf: must have a file
  if (t === 'pdf' && !this.file) {
    return next(new Error('PDF file is required.'));
  }

  // assignment: file + dueDate, maxMarks default handled
  if (t === 'assignment') {
    if (!this.file) return next(new Error('Assignment file is required.'));
    if (!this.meta?.dueDate) return next(new Error('Assignment dueDate is required.'));
    if (this.meta.maxMarks == null) this.meta.maxMarks = 100;
  }

  // notes: content required
  if (t === 'notes') {
    const content = this.meta?.content;
    if (!content || !String(content).trim()) {
      return next(new Error('Notes content is required.'));
    }
  }

  // link: link required
  if (t === 'link' && !this.link) {
    return next(new Error('URL is required for link materials.'));
  }

  // quiz: questions (>=1); expiresAt optional
  if (t === 'quiz') {
    const qs = this.meta?.questions || [];
    if (!Array.isArray(qs) || qs.length === 0) {
      return next(new Error('Quiz must include at least one question.'));
    }
  }

  // chatbot: at least one FAQ pair
  if (t === 'chatbot') {
    const faqs = this.meta?.faqs || [];
    const valid = Array.isArray(faqs) && faqs.some(f => f.q && f.q.trim() && f.a && f.a.trim());
    if (!valid) return next(new Error('Add at least one FAQ (question & answer).'));
  }

  next();
});

module.exports = mongoose.model('Material', MaterialSchema);
