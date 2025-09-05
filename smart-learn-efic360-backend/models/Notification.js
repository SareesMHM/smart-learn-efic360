// models/Notification.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId:  { type: Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String },
    grade:   { type: Number },
    materialId: { type: Schema.Types.ObjectId, ref: 'Content', default: null },
    title:   { type: String, required: true },
    message: { type: String, default: '' },
    type: {
      type: String,
      enum: ['video','pdf','assignment','notes','link','quiz','chatbot','general'],
      default: 'general'
    },
    link: { type: String, default: '' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// indexes (only here; nowhere else)
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ subject: 1, grade: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ readBy: 1, createdAt: -1 });

// validation
NotificationSchema.pre('validate', function(next) {
  const hasDirect = !!this.userId;
  const hasBroadcast = this.grade != null || !!this.subject;
  if (!hasDirect && !hasBroadcast) {
    return next(new Error('Notification must target either a userId or (grade/subject).'));
  }
  next();
});

// IMPORTANT: guard against recompilation
module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);
