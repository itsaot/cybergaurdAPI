const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    flaggedByUserId: {
      type: String, // or mongoose.Schema.Types.ObjectId if you track real users
      default: null,
    },
    flaggedBySessionId: {
      type: String,
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flag", flagSchema);
