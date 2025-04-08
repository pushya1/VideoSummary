const { chatClient } = require("../config/azureConfig");
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const File = require("../models/File");

const getLatestFileTranscription = async (googleId) => {
  try {
    const user = await User.findOne({ googleId }).select('files').lean();

    if (!user || !user.files.length) {
      throw new Error("User or their files not found.");
    }

    const fileIds = user.files.map(f => f.fileId);

    const latestFile = await File.findOne({ _id: { $in: fileIds } })
      .sort({ createdAt: -1 }) // ✅ Get the most recently created file
      .select('transcription') // Or add more: 'fileName key summary'
      .lean();

    if (!latestFile) {
      throw new Error("No file document found.");
    }

    return latestFile.transcription;

  } catch (error) {
    console.error("Error fetching latest file transcription:", error.message);
    throw error;
  }
};


const chatbotResponse = async (req, res) => {
  if (!req.body.message) return res.status(400).json({ error: "Message is required" });
    //get googleId from jwt;
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Extract the token after "Bearer "
    }
    if (!token) {
      return res.status(401).send("Unauthorized: No JWT token provided.");
    }
    let decodedToken;
    const secretKey = process.env.JWT_SECRET;
    decodedToken = jwt.verify(token, secretKey);
    const googleId = decodedToken.googleId;

    const transcriptionResult = await getLatestFileTranscription(googleId);

  try {
    const chatbotResult = await chatClient.chat.completions.create({
      messages: [
        { role: "system", content: `You are a chatbot. Answer user questions based on this context: ${transcriptionResult}` },
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
