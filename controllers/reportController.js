const Report = require('../models/Report');

const { default: OpenAI } = await import('openai');
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});
const createReport = async (req, res) => {
  try {
    const { incidentType, platform, description, yourRole, evidence, anonymous } = req.body;

    const newReport = new Report({ incidentType, platform, description, yourRole, evidence, anonymous });

    // AI severity analysis
    const aiResponse = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{
        role: 'user',
        content: `Analyze this incident description and assign severity (low, medium, high). Respond only with JSON: {"severity":"<low|medium|high>", "confidence": <0-1>, "notes":"<optional explanation>"} Description: ${description}`
      }],
      temperature: 0.2
    });

    const reply = aiResponse.choices[0]?.message?.content;

    try {
      const aiData = JSON.parse(reply);
      newReport.severity = aiData.severity || 'medium';
      newReport.aiConfidence = aiData.confidence || 0;
      newReport.aiNotes = aiData.notes || '';
      newReport.aiAnalyzed = true;
    } catch (err) {
      console.warn('Failed to parse AI response, using defaults', err);
    }

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create report', error: err.message });
  }
};
// POST /api/reports
/*exports.createReport = async (req, res) => {
  try {
    const {
      incidentType,
      platform,
      description,
      date,
      severity,
      yourRole,
      evidence,
      anonymous,
    } = req.body;

    if (!incidentType || !platform || !description || !yourRole) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const report = new Report({
      incidentType,
      platform,
      description,
      date,
      severity,
      yourRole,
      evidence,
      anonymous,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (err) {
    console.error("Error in createReport:", err);
    res.status(500).json({ message: "Failed to submit report", error: err.message });
  }
};*/

// GET /api/reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

// GET /api/reports/:id
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    console.error("Error fetching report by ID:", err);
    res.status(500).json({ message: "Error fetching report" });
  }
};

// PATCH /api/reports/:id/flag
exports.flagReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { flagged: true },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json({ message: "Report flagged", report });
  } catch (err) {
    console.error("Error flagging report:", err);
    res.status(500).json({ message: "Error flagging report" });
  }
};

// ✅ GET /api/reports/flagged
exports.getFlaggedReports = async (req, res) => {
  try {
    const flaggedReports = await Report.find({ flagged: true }).sort({ createdAt: -1 });
    res.json(flaggedReports);
  } catch (err) {
    console.error("Error fetching flagged reports:", err);
    res.status(500).json({ message: "Error fetching flagged reports" });
  }
};

// ✅ DELETE /api/reports/:id (admin only)
exports.deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ message: "Error deleting report" });
  }
};
// PATCH /api/reports/:id/react
exports.reactToReport = async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = req.user.id;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Remove any previous reaction from this user
    report.reactions = report.reactions.filter(r => r.user.toString() !== userId);

    // Add new reaction
    report.reactions.push({ emoji, user: userId });

    await report.save();

    res.json({ message: "Reaction added", reactions: report.reactions });
  } catch (err) {
    console.error("Error reacting to report:", err);
    res.status(500).json({ message: "Error reacting to report" });
  }
};
// POST /api/posts/:id/react
const reactToPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?._id;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ message: "Emoji is required and must be a string" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.reactions) {
      post.reactions = {};
    }

    // Increment emoji count
    const currentCount = post.reactions.get(emoji) || 0;
    post.reactions.set(emoji, currentCount + 1);

    await post.save();

    res.status(200).json({
      message: `Reacted with ${emoji}`,
      reactions: Object.fromEntries(post.reactions),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to react" });
  }
};
