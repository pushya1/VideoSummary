const fs = require("fs");
const { transcribeClient, chatClient } = require("../config/azureConfig");
const s3 = require("../config/s3Config");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const jwt = require('jsonwebtoken');
const File = require("../models/File");
const User = require("../models/User");
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

function generateUUID() {
  return uuidv4();
}

const transcribeAudio = async (req, res) => {
  const filePath = req.file.path;
  if (!fs.existsSync(filePath)) return res.status(400).send("File not found.");

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

  const newUUID = generateUUID();
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
    res.json({ transcription, summary});

    let newDoc = "";
    // Asynchronously upload to S3
    (async () => {
      try {
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
          Bucket: "audioandvideofilesbucket",
          Key: newUUID,
          Body: fileStream,
          ContentType: req.file.mimetype,
        };
        const file = new PutObjectCommand(uploadParams);
        const response = await s3.send(file) 
        fs.unlinkSync(filePath); // Delete file after successful upload
        if(response.$metadata.httpStatusCode === 200){
          console.log("sucessfully uploaded.");
          const newFile = new File({
            userId: googleId,
            fileName: req.file.originalname,
            bucket: "audioandvideofilesbucket",
            key: newUUID,
            transcription: transcription,
            summary: summary,
          });
          const mongoResponse = await newFile.save();
          console.log("mongoresponse: ",mongoResponse);
          console.log("mongoId: ",mongoResponse._id);
          console.log("File details saved to MongoDB.");
          newDoc = [{
            fileId: mongoResponse._id,
            fileName: mongoResponse.fileName,
          }];
        }
        try {
          const updatedUser = await User.findOneAndUpdate(
            { googleId: googleId }, // Dynamic filter based on the key-value pair
            {
              $push: { files: { $each: newDoc } }, // Append new files to the existing files array
            },
            { new: true } // Return the updated document
          );
      
          if (!updatedUser) {
            console.log('User not found.');
            return;
          }
      
          console.log('Updated User:', updatedUser);
        } catch (err) {
          console.error('Error updating user:', err);
        }
      } catch (uploadError) {
        console.error("Error uploading file to S3:", uploadError.message);
      }
    })();

  } catch (error) {
    res.status(500).json({ error: "Error processing the audio file" });
  }
};

module.exports = { transcribeAudio };
