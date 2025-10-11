// /src/controllers/chatbotController.js
require("dotenv").config();

const chat = async (req, res) => {
  try {
    const { default: OpenAI } = await import("openai");

    console.log("DEEPSEEK_API_KEY:", process.env.DEEPSEEK_API_KEY ? "[FOUND]" : "[NOT FOUND]");
    console.log("Incoming request body:", req.body);

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: message }],
      temperature: 0.3,
    });

    const reply = response.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("No reply from DeepSeek response:", response);
      return res.status(500).json({ error: "No reply from DeepSeek" });
    }

    console.log("DeepSeek reply:", reply);
    return res.status(200).json({ reply, source: "deepseek" });

  } catch (error) {
    console.error("💥 DeepSeek error caught!");
    console.error("Message:", error.message);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    if (error.stack) console.error(error.stack);

    // Fallback keyword-based severity analysis
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
      reply: `⚠ This report seems to be **${severity.toUpperCase()} severity** based on the description.`,
      source: "fallback",
    });
  }
};

module.exports = { chat };
