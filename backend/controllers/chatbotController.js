const { chatClient } = require("../config/azureConfig");

const chatbotResponse = async (req, res) => {
  if (!req.body.message) return res.status(400).json({ error: "Message is required" });

  try {
    const chatbotResult = await chatClient.chat.completions.create({
      messages: [
        { role: "system", content: "You are a chatbot. Answer user questions." },
        { role: "user", content: req.body.message },
      ],
      model: "gpt-35-turbo-16k",
    });

    res.status(200).json({ output: chatbotResult.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate chatbot response" });
  }
};

module.exports = { chatbotResponse };
