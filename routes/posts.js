const express = require("express");
const router = express.Router();

const {
  getPosts,
  createPost,
  getPostById,
  toggleLikePost,
  addComment,
  replyToComment,
  deleteComment,
  softDeletePost,
  flagPost,
  deletePost, // Assuming you have this in your controller for full delete
} = require("../controllers/postController");

const { auth, isAdmin, verifyToken, verifyAdmin } = require("../middleware/auth");

// Public routes (no auth required)
router.get("/", getPosts);
router.post("/", createPost);
router.get("/:id", getPostById);

// Like/unlike toggling (no auth required)
router.post("/:postId/like", toggleLikePost);

// Comments (no auth required for adding comments and replies)
router.post("/:postId/comments", addComment);
router.post("/:postId/comments/:commentId/replies", replyToComment);

// Authenticated routes
router.delete("/:postId/comments/:commentId", auth, deleteComment); // User can delete own comment or admin can delete any

// Admin-only routes
router.delete("/:postId", auth, isAdmin, softDeletePost);  // Soft delete post (hide from users)
router.delete("/:postId/full", auth, isAdmin, deletePost); // Full delete post (if implemented)
router.post("/:postId/flag", auth, isAdmin, flagPost);
router.delete("/:postId/full", auth, isAdmin, deletePost);

module.exports = router;
