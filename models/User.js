const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user",
  },
});

module.exports = mongoose.model("User", UserSchema);
// This code defines a Mongoose schema for a User model in a Node.js application.
// The schema includes fields for username, password, and role, with role having a default value