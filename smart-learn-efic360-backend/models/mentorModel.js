const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: Date, required: true },           // Specific date
  startTime: { type: String, required: true },    // e.g. "10:00 AM"
  endTime: { type: String, required: true },      // e.g. "11:00 AM"
  isBooked: { type: Boolean, default: false },    // Track booking status
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who booked it
});

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Expertise areas – allow multiple
  expertise: [{ type: String, required: true }], // e.g. ["Maths", "AI", "History"]

  // Subjects/grades they teach (linked to your ContentManager)
  subjects: [{ type: String }],  // e.g. ["Maths", "Science"]
  grades: [{ type: Number }],    // e.g. [6,7,8,9,10,11]

  // Availability slots
  availableSlots: [slotSchema],

  // Mentor profile
  bio: { type: String, default: '' },
  qualifications: { type: String },   // e.g. "BSc in IT, MSc in AI"
  yearsOfExperience: { type: Number, default: 0 },
  profileImage: { type: String },     // optional profile picture

  // Status tracking
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },

  // Ratings & feedback from students
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to auto-update `updatedAt`
mentorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Mentor = mongoose.model('Mentor', mentorSchema);
module.exports = Mentor;
