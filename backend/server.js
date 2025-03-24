const {AzureOpenAI} = require("openai");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const FormData = require("form-data");
const cors = require("cors");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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
const apiKeyAudio = process.env.apiKeyAudio
const apiVersionAudio = "2024-05-01-preview";
const deploymentAudio = 'tts-hd'


const transcribeClient = new AzureOpenAI({
  endpoint: endpointWhisper,
  apiKey: apiKeyWhisper,
  apiVersion: apiVersionWisper,
  deployment: deploymentWisper
  });

const streamClient = new AzureOpenAI({ 
  endpoint: endpointAudio, 
  apiKey:apiKeyAudio, 
  apiVersion:apiVersionAudio, 
  deployment:'tts-hd' 
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

app.use(cors());
app.use(express.json());

// Configure multer for file uploads with correct extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    const originalExtension = path.extname(file.originalname); // Extract the original file extension
    const fileName = `${file.fieldname}-${Date.now()}${originalExtension}`; // Add timestamp to make the file name unique
    cb(null, fileName);
  },
});

const upload = multer({ storage });
let storedTranscription;

// Endpoint to handle audio upload and transcription
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  const filePath = req.file.path;
  if (!fs.existsSync(filePath)) {
    return res.status(400).send("File not found on server.");
  }
  
  try {
    // Create a FormData instance and append the audio file
    let data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    
    const result = await transcribeClient.audio.transcriptions.create({
      model:deploymentWisper,
      file: fs.createReadStream(filePath),
    })
    console.log("transcription:",result.text);

    // Transcription result
    const transcription = result.text;
    storedTranscription = result.text;
    // Initialize summarization result as null
    let summarization = null;

    try {
      // Now, attempt to summarize the transcribed text using GPT-4
      const chatClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
      const result = await chatClient.chat.completions.create({
        messages: [
          { role: "system", content: "You are a summarizer. You will summarize the given text in a concise way" },
          { role: "user", content: transcription },
        ],
        model: deployment,
      });

      summarization = result.choices[0].message.content;
      console.log('Summarization :', summarization);
    } catch (summarizationError) {
      console.log('Error summarizing text:', summarizationError.message);
    }


    // Respond with transcription data and summarization (if successful)
    res.json({
      transcription: transcription,
      summarization: summarization,
    });
    
     // **Asynchronous Upload to S3**
    (async () => {
      try {
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
          Bucket: "audioandvideofilesbucket",
          Key: `${req.file.originalname}`,
          Body: fileStream,
          ContentType: req.file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        console.log("File uploaded to S3 successfully:", req.file.originalname);

        // **Delete local file after uploading**
        fs.unlinkSync(filePath);
      } catch (uploadError) {
        console.error("Error uploading file to S3:", uploadError.message);
        if(filePath){
          fs.unlinkSync(filePath)
        }
      }
    })();

  } catch (error) {
    console.error("Error transcribing audio:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Error processing the audio file",
    });
  }
});



app.post("/stream",async(req,res)=>{

  const {text} = req.body;
  if(!text) return res.status(400).json({error: "Text is required"});

  try{
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    const streamToRead = await streamClient.audio.speech.create({
      model: deploymentAudio,
      voice: "alloy",
      input: req.body.text,
      response_format: "mp3",
      stream: true,
    });
    const stream = streamToRead.body;
    if(!stream) {
      throw new Error("No stream returned from OpenAI API");
    }

    console.log("Streaming audio..");
    stream.pipe(res);
  }catch(error){
    console.error("Error generating speech:",error);
    res.status(500).json({error:"Failed to generate speech"});
  }

});


app.post('/chatbot',async(req,res)=>{
  if (!req.body.message) {
    return res.status(400).json({ error: "Message is required" });
  }
  try {
    const chatbotResult = await chatclient.chat.completions.create({
      messages: [
        { role: "system", content: `You are a chatbot. You will answer to the questions based on the given content ${storedTranscription}.` },
        { role: "user", content: req.body.message },
      ],
      model: deployment,
    });
    chatbotSolution = chatbotResult.choices[0].message.content;
    console.log('\n Chatbot solution :', chatbotSolution);
    res.status(200).json({output:chatbotSolution})
  } catch (error) {
    console.log('Error chatbot :', error.message);
  }
})

app.get('/',(req,res)=>{
  res.status(200).send("Welcome to VideoSummary");
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
