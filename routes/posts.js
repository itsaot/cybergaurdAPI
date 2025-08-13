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
router.post("/", createPost); // Allow anonymous or authenticated
router.get("/:id", getPostById);

// Like/unlike (anonymous possible)
router.post("/:postId/like", toggleLikePost);

// React to post (anonymous possible)
router.post("/:id/react", reactToPost);

// Comments (anonymous possible)
router.post("/:postId/comments", addComment);
router.post("/:postId/comments/:commentId/replies", replyToComment);

// Delete own comment (optional — leave public delete if no login)
router.delete("/:postId/comments/:commentId", deleteComment);

// Flagging (anonymous possible)
router.post("/:postId/flag", flagPost);

// Admin-only
router.delete("/:postId", isAdmin, softDeletePost);
router.delete("/:postId/full", isAdmin, deletePost);

module.exports = router;
