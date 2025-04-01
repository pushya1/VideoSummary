const { AzureOpenAI } = require("openai");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const FormData = require("form-data");
const cors = require("cors");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const endpointWhisper = process.env.endpointWhisper;
const apiKeyWhisper = process.env.apiKeyWhisper;
const apiVersionWisper = "2024-06-01";
const deploymentWisper = "whisper";

const endpoint = process.env.endpoint;
const apiKey = process.env.apiKey;
const apiVersion = "2024-08-01-preview";
const deployment = "gpt-35-turbo-16k";

const endpointAudio = process.env.endpointAudio;
const apiKeyAudio = process.env.apiKeyAudio;
const apiVersionAudio = "2024-05-01-preview";
const deploymentAudio = 'tts-hd';

const transcribeClient = new AzureOpenAI({
  endpoint: endpointWhisper,
  apiKey: apiKeyWhisper,
  apiVersion: apiVersionWisper,
  deployment: deploymentWisper
});

const streamClient = new AzureOpenAI({ 
  endpoint: endpointAudio, 
  apiKey: apiKeyAudio, 
  apiVersion: apiVersionAudio, 
  deployment: deploymentAudio 
});
  
const chatclient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
  
const s3 = new S3Client({ 
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const app = express();
const port = 5000;

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(express.json());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      displayName: user.displayName,
      email: user.emails[0].value,
      photo: user.photos[0].value,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:3000/?token=${token}`);
  }
);

app.get("/user", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const originalExtension = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${Date.now()}${originalExtension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });
let transcription;

app.post("/transcribe", authenticateJWT, upload.single("audio"), async (req, res) => {
  let summary;
  const filePath = req.file.path;
  if (!fs.existsSync(filePath)) {
    return res.status(400).send("File not found on server.");
  }

  try {
    const transcriptionResult = await transcribeClient.audio.transcriptions.create({
      model: deploymentWisper,
      file: fs.createReadStream(filePath),
    });

    transcription = transcriptionResult.text;

    try {
      const chatClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
      const result = await chatClient.chat.completions.create({
        messages: [
          { role: "system", content: "You are a summarizer. You will summarize the given text in a concise way" },
          { role: "user", content: transcription },
        ],
        model: deployment,
      });

      summary = result.choices[0].message.content;
    } catch (summarizationError) {
      console.log('Error summarizing text:', summarizationError.message);
    }
    res.json({ transcription, summary });
  } catch (error) {
    res.status(500).json({ error: "Error processing the audio file" });
  }
});

app.post("/stream", authenticateJWT, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  try {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    const streamToRead = await streamClient.audio.speech.create({
      model: deploymentAudio,
      voice: "alloy",
      input: text,
      response_format: "mp3",
      stream: true,
    });
    streamToRead.body.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

app.post("/chatbot", authenticateJWT, async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: "Message is required" });
  }
  try {
    const chatbotResult = await chatclient.chat.completions.create({
      messages: [
        { role: "system", content: `You are a chatbot. You will answer questions based on the given content: ${transcription}.` },
        { role: "user", content: req.body.message },
      ],
      model: deployment,
    });
    res.status(200).json({ output: chatbotResult.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate chatbot response" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});