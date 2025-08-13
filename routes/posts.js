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
router.post("/", auth, createPost); // Requires auth for named posts (but controller can handle anonymous if no userId)
router.get("/:id", getPostById);

// Like/unlike (NO auth so anonymous users can like)
router.post("/:postId/like", toggleLikePost);
router.post("/:id/react", reactToPost); // Removed auth for anonymous reactions

// Comments (requires auth to post comments — can change if needed)
router.post("/:postId/comments", auth, addComment);
router.post("/:postId/comments/:commentId/replies", auth, replyToComment);

// Authenticated routes
router.delete("/:postId/comments/:commentId", auth, deleteComment);

// Flagging — let all authenticated users flag
router.post("/:postId/flag", auth, flagPost);

// Admin-only routes
router.delete("/:postId", auth, isAdmin, softDeletePost);
router.delete("/:postId/full", auth, isAdmin, deletePost);

module.exports = router;
