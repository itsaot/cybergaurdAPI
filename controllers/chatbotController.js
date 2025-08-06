// /src/controllers/chatbotController.js

require("dotenv").config();

const chat = async (req, res) => {
  try {
    // Dynamically import OpenAI SDK v4+
    const { default: OpenAI } = await import("openai");

    console.log("OPENAI_API_KEY in chatbotController:", process.env.OPENAI_API_KEY ? "[FOUND]" : "[NOT FOUND]");
    console.log("Incoming request body:", req.body);

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    console.log("OpenAI response:", response);

    const reply = response.choices[0]?.message?.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { chat };
