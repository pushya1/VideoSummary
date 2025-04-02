const fs = require("fs");
const { transcribeClient, chatClient } = require("../config/azureConfig");

const transcribeAudio = async (req, res) => {
  const filePath = req.file.path;
  if (!fs.existsSync(filePath)) return res.status(400).send("File not found.");

  try {
    const transcriptionResult = await transcribeClient.audio.transcriptions.create({
      model: "whisper",
      file: fs.createReadStream(filePath),
    });

    const transcription = transcriptionResult.text;

    const result = await chatClient.chat.completions.create({
      messages: [
        { role: "system", content: "Summarize this text concisely." },
        { role: "user", content: transcription },
      ],
      model: "gpt-35-turbo-16k",
    });

    const summary = result.choices[0].message.content;
    res.json({ transcription, summary });
  } catch (error) {
    res.status(500).json({ error: "Error processing the audio file" });
  }
};

module.exports = { transcribeAudio };
