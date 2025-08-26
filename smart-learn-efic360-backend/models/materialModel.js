// // models/User.js
// const mongoose = require('mongoose');

// const contentSchema = new mongoose.Schema({
//   title:{
//     type:String,
//     required:true
//   },
//   description:{
//     type:String
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   }
// }, {
//   discriminatorKey: 'type',
//   collection: 'contents'
// });

// const videoSchema = new mongoose.Schema(
//   {
//      source: { type: String, enum: ["upload", "url"], required: true },

//     // When source = 'upload'
//     file: { type: String, trim: true },           // stored filename

//     // When source = 'url'
//     url: {
//       type: String,
//       trim: true,
//       match: [/^https?:\/\/.+/i, "Video URL must start with http(s)://"],
//     },
//   },
//   { discriminatorKey: 'type', _id: false }
// ); 



// const pdfSchema=new mongoose.Schema({
//     file: { type: String, trim: true ,required:true}, 
// }, {
//     discriminatorKey: 'type',
//     _id: false, // to disable automatic _id generation for discriminator models
// })

// const assingmentSchema=new mongoose.Schema({
//      file: { type: String, trim: true ,required:true}, 
//      date:{
//       type:Date,
//       required:true,
//      },
//      maxMarks:{
//       type:Number,
//       required:true
//      }
// },{
//     discriminatorKey: 'type',
//     _id: false, // to disable automatic _id generation for discriminator models
// })

// const notesSchema=new mongoose.Schema({
  
//   notes:{type:String,required:true}

// },{
//     discriminatorKey: 'type',
//     _id: false, // to disable automatic _id generation for discriminator models
// })

// const linkSchema=new mongoose.Schema({
  
//   url:{type:String,required:true}

// },{
//     discriminatorKey: 'type',
//     _id: false, // to disable automatic _id generation for discriminator models
// })

// /** One MCQ */
// const QuestionSchema = new Schema(
//   {
//     question: { type: String, required: true, trim: true },

//     // dynamic list of options
//     options: {
//       type: [{ type: String, trim: true }],
//       validate: {
//         validator: (arr) => Array.isArray(arr) && arr.filter(Boolean).length >= 2,
//         message: "Provide at least two non-empty options.",
//       },
//     },

//     // single-correct index
//     correctIndex: {
//       type: Number,
//       default: 0,
//       validate: {
//         validator: function (v) {
//           return Number.isInteger(v) && v >= 0 && v < (this.options?.length || 0);
//         },
//         message: "correctIndex must reference an existing option.",
//       },
//     },

//     // points for this question
//     points: { type: Number, min: 1, default: 1 },
//   },
//   { _id: false }
// );

// // sanitize options & re-check bounds
// QuestionSchema.pre("validate", function (next) {
//   this.options = (this.options || []).map((s) => (s || "").trim()).filter(Boolean);
//   if (this.options.length < 2) return next(new Error("Provide at least two non-empty options."));
//   if (!Number.isInteger(this.correctIndex) || this.correctIndex < 0 || this.correctIndex >= this.options.length) {
//     this.correctIndex = 0; // or: return next(new Error(...));
//   }
//   next();
// });

// /** Quiz schema (array of questions) */
// const quizSchema = new Schema(
//   {
//     questions: {
//       type: [QuestionSchema],
//       validate: {
//         validator: (arr) => Array.isArray(arr) && arr.length > 0,
//         message: "Quiz must have at least one question.",
//       },
//     },

//     // optional computed cache (recalculated on validate)
//     totalPoints: { type: Number, default: 0 },
//   },
//   {
//     discriminatorKey: "type",
//     _id: false, // as you wanted
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // keep totalPoints in sync
// quizSchema.pre("validate", function (next) {
//   this.totalPoints = (this.questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0);
//   next();
// });



// const Content = mongoose.model('Content', contentSchema);

// const Video = Content.discriminator(
//   'Video',             // model name (can stay capitalized)
//   videoSchema,
//   'video'              // value stored in discriminatorKey field
// );

// const Pdf = Content.discriminator('Pdf', pdfSchema, 'pdf');
// const Assignment  = Content.discriminator('Assingment', assingmentSchema, 'assingment');
// const Notes   = Content.discriminator('Notes', notesSchema, 'notes');
// const Links   = Content.discriminator('Links', linkSchema, 'link');
// const Quiz   = Content.discriminator('Quiz', quizSchema, 'quiz');


// module.exports = {
//   Video,
//   Pdf,
//   Assignment,
//   Notes,
//   Links,
//   Quiz
// };


// models/content.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ---------- Base Content ---------- */
const ContentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    discriminatorKey: "type",
    collection: "contents",
    // timestamps: true, // optional if you want updatedAt
  }
);

// Register base
const Content = mongoose.model("Content", ContentSchema);

/* ---------- Video ---------- */
const VideoSchema = new Schema({
  source: { type: String, enum: ["upload", "url"], required: true },
  file: { type: String, trim: true }, // when source=upload
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

/* ---------- Assingment (kept your spelling/value) ---------- */
const AssingmentSchema = new Schema({
  file: { type: String, trim: true, required: true },
  date: { type: Date, required: true },
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

QuizSchema.pre("validate", function (next) {
  this.totalPoints = (this.questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  next();
});

const Quiz = Content.discriminator("Quiz", QuizSchema, "quiz");

module.exports = { Content, Video, Pdf, Assignment, Notes, Links, Quiz };
