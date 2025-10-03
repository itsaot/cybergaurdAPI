require("dotenv").config();
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const ENDPOINT = "https://models.github.ai/inference";
const MODEL = "deepseek/DeepSeek-V3-0324";

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!DEEPSEEK_API_KEY) {
      console.warn("DeepSeek API key missing, using fallback.");
      throw new Error("API key missing");
    }

    // ---------------------------
    // DeepSeek call
    // ---------------------------
    const client = ModelClient(ENDPOINT, new AzureKeyCredential(DEEPSEEK_API_KEY));

    const response = await client.path("/chat/completions").post({
      body: {
        model: MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const reply = response.body.choices?.[0]?.message?.content || "No response from AI";

    return res.status(200).json({ reply, source: "deepseek" });

  } catch (error) {
    console.error("DeepSeek error, using fallback:", error.message);

    // ---------------------------
    // Fallback: simple severity classifier
    // ---------------------------
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
      reply: `⚠️ This report seems to be **${severity.toUpperCase()} severity** based on the description.`,
      source: "fallback",
    });
  }
};

module.exports = { chat };
