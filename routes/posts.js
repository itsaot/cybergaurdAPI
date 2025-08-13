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
} = require("../controllers/postController");

const { auth, isAdmin } = require("../middleware/auth");

// Public routes
router.get("/", getPosts);
router.post("/",auth, createPost); // 🔒 You might want to secure this too
router.get("/:id", getPostById);

// Like/unlike
router.post("/:postId/like", auth, toggleLikePost); // ✅ added auth
router.post("/:id/react", auth, reactToPost);
// Comments
router.post("/:postId/comments",auth, addComment);
router.post("/:postId/comments/:commentId/replies",auth, replyToComment);

// Authenticated routes
router.delete("/:postId/comments/:commentId", auth, deleteComment);

// Flagging — let all authenticated users flag
router.post("/:postId/flag", auth, flagPost); // ✅ remove isAdmin unless only admins can flag

// Admin-only routes
router.delete("/:postId", auth, isAdmin, softDeletePost);
router.delete("/:postId/full", auth, isAdmin, deletePost);

module.exports = router;
