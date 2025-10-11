// /src/controllers/chatbotController.js
import dotenv from "dotenv";
dotenv.config();

export const chat = async (req, res) => {
  try {
    const { default: OpenAI } = await import("openai");

    console.log("DEEPSEEK_API_KEY:", process.env.DEEPSEEK_API_KEY ? "[FOUND]" : "[NOT FOUND]");
    console.log("Incoming request body:", req.body);

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Initialize DeepSeek client
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    // Send message to DeepSeek AI
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: message }],
      temperature: 0.3,
    });

    const reply = response.choices[0]?.message?.content || "No response received.";

    // ✅ Return in frontend-compatible format
    return res.status(200).json({
      response: reply,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("DeepSeek error:", error.message);

    // 🔻 Simple fallback classifier
    const { message } = req.body;
    let severity = "low";

    const highRiskWords = ["kill", "suicide", "weapon", "rape", "murder"];
    const mediumRiskWords = ["fight", "threat", "beat", "bully", "abuse"];

    if (highRiskWords.some((w) => message.toLowerCase().includes(w))) {
      severity = "high";
    } else if (mediumRiskWords.some((w) => message.toLowerCase().includes(w))) {
      severity = "medium";
    }

    return res.status(200).json({
      response: `⚠️ This report seems to be **${severity.toUpperCase()} severity** based on the description.`,
      timestamp: new Date().toISOString(),
    });
  }
};
