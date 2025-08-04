const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // put your OpenAI API key in .env
});

const openai = new OpenAIApi(configuration);

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful and compassionate assistant for bullying support." },
        { role: "user", content: message },
      ],
    });

    const responseMessage = completion.data.choices[0].message.content;

    res.json({ reply: responseMessage });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ message: "Chatbot service failed" });
  }
};
