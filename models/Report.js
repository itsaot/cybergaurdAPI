const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  incidentType: {
    type: String,
    required: [true, 'Incident type is required'],
    trim: true,
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0], // "YYYY-MM-DD"
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  yourRole: {
    type: String,
    required: [true, 'Your role is required'],
    enum: ['target', 'bystander', 'reporter', 'other'],
    lowercase: true,
    trim: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  evidence: {
    type: String,
    trim: true,
  },
  anonymous: {
    type: Boolean,
    default: true,
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  // NEW: emoji reactions on reports
  reactions: [{
    emoji: String,                     // e.g. "❤️", "😢"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Report', ReportSchema);
