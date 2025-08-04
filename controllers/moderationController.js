const Flag = require("../models/Flag");
const Advice = require("../models/Advice");

// Flag a post (anonymous users can flag by providing sessionId or userId optionally)
exports.flagPost = async (req, res) => {
  try {
    const { postId, reason, userId, sessionId } = req.body;

    // Prevent duplicate flags by same userId or sessionId if provided
    let existingFlag;

    if (userId) {
      existingFlag = await Flag.findOne({ post: postId, flaggedByUserId: userId });
    } else if (sessionId) {
      existingFlag = await Flag.findOne({ post: postId, flaggedBySessionId: sessionId });
    }

    if (existingFlag) {
      return res.status(400).json({ msg: "You have already flagged this post" });
    }

    const flag = new Flag({
      post: postId,
      reason,
      flaggedByUserId: userId || null,
      flaggedBySessionId: sessionId || null,
    });

    await flag.save();
    res.status(201).json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all flags (admin only)
exports.getFlags = async (req, res) => {
  try {
    const flags = await Flag.find().populate("post", "content");
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Give advice on a post (anonymous users, optional userId/sessionId)
exports.giveAdvice = async (req, res) => {
  try {
    const { postId, message, userId, sessionId } = req.body;

    const advice = new Advice({
      post: postId,
      message,
      advisorUserId: userId || null,
      advisorSessionId: sessionId || null,
    });

    await advice.save();
    res.status(201).json(advice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all advice for a post (public)
exports.getAdviceByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const advice = await Advice.find({ post: postId });
    res.json(advice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
