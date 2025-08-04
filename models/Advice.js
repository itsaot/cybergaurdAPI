const mongoose = require("mongoose");

const adviceSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    advisorUserId: {
      type: String,
      default: null,
    },
    advisorSessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advice", adviceSchema);
