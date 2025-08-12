const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "[FOUND]" : "[NOT FOUND]");

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  "https://preview--cyberguard-speak-up.lovable.app",
  "https://cyberguard-speak-up.vercel.app",
  // Add more frontend URLs here if needed, e.g.:
  // "https://your-production-domain.com"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow requests with no origin (curl, postman)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Allow cookies and auth headers in cross-origin requests
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', require('./routes/incidentRoutes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/moderation', require('./routes/moderation'));
app.use('/api/escalation', require('./routes/escalation'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// 404 handler (keep after routes)
app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Error handler (final fallback)
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
