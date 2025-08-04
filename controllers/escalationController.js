const Post = require("../models/Post");

const escalatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.escalated = true;
    post.escalationDetails = {
      reportedBy: req.user.id,
      reportedAt: new Date(),
    };

    await post.save();
    res.json({ message: "Post escalated to authorities", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { escalatePost };

