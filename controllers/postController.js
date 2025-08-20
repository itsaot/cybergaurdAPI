const Post = require("../models/Post");
const mongoose = require("mongoose");

// Get all posts
const getPosts = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin ? {} : { deletedForUser: false };

    const posts = await Post.find(filter)
      .populate("createdBy", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, author, type, isAnonymous, tags, category, adviceRequested } = req.body;
    if (!content || (!author && !isAnonymous)) {
      return res.status(400).json({ message: "Content and author are required" });
    }

    const newPost = new Post({
      content,
      type: type || "general",
      tags: tags || [],
      category: category || null,
      adviceRequested: adviceRequested || false,
      isAnonymous: isAnonymous || false,
      createdBy: isAnonymous ? null : author,
      createdAt: new Date(),
      likes: [],
      reactions: [],
      comments: [],
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("createdBy", "username")
      .populate("comments.user", "username");

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle like/unlike a post
const toggleLikePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?._id;
    console.log('Here is the full data' + req);
    console.log('Here is the user: ' + req.user);

    if (!userId) return res.status(401).json({ message: "Authentication required to like posts" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.some(id => id.toString() === userId.toString());

    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ liked: !liked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user?._id;
    if (!userId || !text) return res.status(400).json({ message: "User ID and text are required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { user: userId, text, createdAt: new Date(), likes: [], replies: [] };
    post.comments.push(comment);
    await post.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reply to a comment
const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user?._id;
    if (!userId || !text) return res.status(400).json({ message: "User ID and text are required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ user: userId, text, createdAt: new Date(), likes: [] });

    await post.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (userRole !== "admin" && comment.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own comment" });
    }

    comment.remove();
    await post.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin soft delete post
const softDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.deletedForUser = true;
    await post.save();

    res.json({ message: "Post hidden from users but visible to admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Flag a post
const flagPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { reason } = req.body;
    post.flagged = true;
    if (reason) post.flagReason = reason;
    await post.save();

    res.status(200).json({ message: "Post flagged successfully", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin hard delete
const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// React to a post
const reactToPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?._id;
    const username = req.user?.username;
    const { emoji } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!emoji) return res.status(400).json({ message: "Emoji reaction is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.reactions = post.reactions || [];

    const existing = post.reactions.findIndex(r => r.userId.toString() === userId.toString());
    if (existing !== -1) {
      if (post.reactions[existing].emoji === emoji) post.reactions.splice(existing, 1);
      else post.reactions[existing].emoji = emoji;
    } else {
      post.reactions.push({ userId, username, emoji });
    }

    await post.save();
    res.json({ reactions: post.reactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to react to post" });
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  toggleLikePost,
  reactToPost,
  addComment,
  replyToComment,
  deleteComment,
  softDeletePost,
  flagPost,
  deletePost,
};
