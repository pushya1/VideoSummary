const { streamClient } = require("../config/azureConfig");

const generateSpeech = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    res.setHeader("Content-Type", "audio/mpeg");
    const streamToRead = await streamClient.audio.speech.create({
      model: "tts-hd",
      voice: "alloy",
      input: text,
      response_format: "mp3",
      stream: true,
    });

    streamToRead.body.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate speech" });
  }
};

module.exports = { generateSpeech };
