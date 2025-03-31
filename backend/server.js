const {AzureOpenAI} = require("openai");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const FormData = require("form-data");
const cors = require("cors");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();

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
  deployment: 'tts-hd' 
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
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/");
  }
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("/user", isAuthenticated, (req, res) => {
  res.json(req.user);
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

app.post("/transcribe", isAuthenticated, upload.single("audio"), async (req, res) => {
  const filePath = req.file.path;
  if (!fs.existsSync(filePath)) {
    return res.status(400).send("File not found on server.");
  }

  try {
    // Transcribe audio
    const transcriptionResult = await transcribeClient.audio.transcriptions.create({
      model: deploymentWisper,
      file: fs.createReadStream(filePath),
    });

    let summaryText = "Summarization failed.";
    try {
      const chatClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
      const summaryResult = await chatClient.chat.completions.create({
        messages: [
          { role: "system", content: "You are a summarizer. Summarize the given text concisely." },
          { role: "user", content: transcriptionResult.text },
        ],
        model: deployment,
      });

      summaryText = summaryResult.choices[0].message.content;
    } catch (summarizationError) {
      console.error("Error summarizing text:", summarizationError.message);
    }
    transcription = transcriptionResult.text;
    // Send response before S3 upload
    res.json({ transcription: transcription, summarization: summaryText });

    // Asynchronously upload to S3
    (async () => {
      try {
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
          Bucket: "audioandvideofilesbucket",
          Key: req.file.originalname,
          Body: fileStream,
          ContentType: req.file.mimetype,
        };
        await s3.send(new PutObjectCommand(uploadParams));
        fs.unlinkSync(filePath); // Delete file after successful upload
      } catch (uploadError) {
        console.error("Error uploading file to S3:", uploadError.message);
      }
    })();
  } catch (error) {
    res.status(500).json({ error: "Error processing the audio file" });
  }
});


app.post("/stream", isAuthenticated, async (req, res) => {
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

app.post("/chatbot", isAuthenticated, async (req, res) => {
  if (!req.body.message) {
    return res.status(400).json({ error: "Message is required" });
  }
  try {
    const chatbotResult = await chatclient.chat.completions.create({
      messages: [
        { role: "system", content:  `You are a chatbot. You will answer questions based on the given content: ${transcription}.` },
        { role: "user", content: req.body.message },
      ],
      model: deployment,
    });
    res.status(200).json({ output: chatbotResult.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate chatbot response" });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Welcome to VideoSummary");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
