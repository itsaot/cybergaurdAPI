const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [ReplySchema],
});

const PostSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["physical", "verbal", "cyber", "general"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  category: {
    type: String,
  },
  adviceRequested: {
    type: Boolean,
    default: false,
  },
  escalated: {
    type: Boolean,
    default: false,
  },
  escalationDetails: {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportedAt: { type: Date },
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [CommentSchema],
  deletedForUser: {
    type: Boolean,
    default: false,
  },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String }, // Add this field
});

module.exports = mongoose.model("Post", PostSchema);
