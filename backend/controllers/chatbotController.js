const { chatClient } = require("../config/azureConfig");
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const File = require("../models/File");

async function getLatestFileTranscription(googleId) {
  try {
    // Step 1: Find the user and get their latest file
    const user = await User.findOne({ googleId })
      .sort({ 'files.createdAt': -1 }) // Sort files by creation date in descending order
      .select('files')
      .lean();
    
    if (!user || !user.files || user.files.length === 0) {
      throw new Error('User or files not found');
    }
    
    // Get the latest file (first element after sorting)
    const latestFile = user.files[0];
    const fileId = latestFile.fileId;
    
    // Step 2: Query the File model to get the transcription
    const fileDoc = await File.findById(fileId)
      .select('transcription')
      .lean();
    
    if (!fileDoc) {
      throw new Error('File document not found');
    }
    
    return fileDoc.transcription;
    
  } catch (error) {
    console.error('Error fetching latest file transcription:', error);
    throw error;
  }
}

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
    console.log(transcriptionResult)

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
