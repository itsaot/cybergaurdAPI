const express = require("express");
const router = express.Router();

const {
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
  getFlaggedPosts,
} = require("../controllers/postController");

const { auth, isAdmin } = require("../middleware/auth");

// Public routes
router.get("/", getPosts);
router.get("/flagged", isAdmin, getFlaggedPosts);
router.get("/:id", getPostById);
router.post("/",auth, createPost); // 🔒 You might want to secure this too

// Like/unlike
router.post("/:postId/like", auth, toggleLikePost); // ✅ added auth
router.post("/:id/react", auth, reactToPost);
// Comments
router.post("/:postId/comments",auth, addComment);
router.post("/:postId/comments/:commentId/replies",auth, replyToComment);

// Authenticated routes
router.delete("/:postId/comments/:commentId", auth, deleteComment);

// Flagging — let all authenticated users flag
router.post("/:postId/flag", auth, isAdmin, flagPost); // ✅ remove isAdmin unless only admins can flag

// Admin-only routes
router.delete("/:postId", auth, isAdmin, softDeletePost);
router.delete("/:postId/full", auth, isAdmin, deletePost);

module.exports = router;
