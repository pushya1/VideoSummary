const {AzureOpenAI} = require("openai");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const FormData = require("form-data");
const cors = require("cors");
const path = require("path");

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
const speechFilePath = "./downloads/output.mp3";
const apiVersionAudio = "2024-05-01-preview";
const deploymentAudio = 'tts-hd'

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
let storedSummary;
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
    console.log(endpointWhisper)

    const client = new AzureOpenAI({
      endpoint: endpointWhisper,
      apiKey: apiKeyWhisper,
      apiVersion: apiVersionWisper,
      deployment: deploymentWisper
    })
    const result = await client.audio.transcriptions.create({
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
      const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
      const result = await client.chat.completions.create({
        messages: [
          { role: "system", content: "You are a summarizer. You will summarize the given text in a concise way" },
          { role: "user", content: transcription },
        ],
        model: deployment,
      });

      summarization = result.choices[0].message.content;
      storedSummary = summarization;
      console.log('Summarization :', summarization);
    } catch (summarizationError) {
      console.log('Error summarizing text:', summarizationError.message);
    }

    try{
      const client = new AzureOpenAI({ 
        endpoint: endpointAudio, 
        apiKey:apiKeyAudio, 
        apiVersion:apiVersionAudio, 
        deployment:'tts-hd' 
      });
      const streamToRead = await client.audio.speech.create({
        model: deploymentAudio,
        voice: "alloy",
        input: summarization,
      });
      console.log("Streaming response to downloads/output.mp3");
      const buffer = Buffer.from(await streamToRead.arrayBuffer());
      await fs.promises.writeFile(speechFilePath, buffer);
      console.log("Finished streaming");
      
    }catch(error){
      console.log("Error encountered in TTS: ",error.message,error);
    }

    // Respond with transcription data and summarization (if successful)
    res.json({
      transcription: transcription,
      summarization: summarization,
    });

  } catch (error) {
    console.error("Error transcribing audio:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Error processing the audio file",
    });
  } finally {
    fs.unlinkSync(filePath); // Ensure the file is always deleted after processing
  }
});

app.get("/stream-audio",(req,res)=>{
  const filePath = path.join(__dirname,"downloads","output.mp3");
  //set the headers
  res.setHeader("Content-Type","audio/mpeg");
  res.setHeader("Cache-Control", "no-store"); // Disable caching
  //stream the file
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res).on("error",(err)=>{
    console.error("Error streaming file:",err);
    res.status(500).send("Error streaming the audio file.");
  });
});

app.get("/stream-translation-audio",(req,res)=>{
  const filePath = path.join(__dirname,"downloads","translation_output.mp3");
  //set the headers
  res.setHeader("Content-Type","audio/mpeg");
  res.setHeader("Cache-Control", "no-store"); // Disable caching
  //stream the file
  const readStream = fs.createReadStream("./downloads/translation_output.mp3");
  readStream.pipe(res).on("error",(err)=>{
    console.error("Error streaming file:",err);
    res.status(500).send("Error streaming the audio file.");
  });
});

app.get("/translate",async(req,res)=>{
  let transcriptionTranslation;
  let summaryTranslation;
  const language = req.query.language;
  console.log(language);
  try {
    // Now, attempt to summarize the transcribed text using GPT-4
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    const translationResult = await client.chat.completions.create({
      messages: [
        { role: "system", content: `You are a translator. You will translate the given text to ${language}.` },
        { role: "user", content: storedTranscription },
      ],
      model: deployment,
    });

    transcriptionTranslation = translationResult.choices[0].message.content;
    console.log('\n Transcription Translation :', transcriptionTranslation);

    const summaryResult = await client.chat.completions.create({
      messages: [
        { role: "system", content: `You are a translator. You will translate the given text to ${language}.`},
        { role: "user", content: storedSummary },
      ],
      model: deployment,
    });

    summaryTranslation = summaryResult.choices[0].message.content;
    console.log('\n Summary Translation :', summaryTranslation);
  } catch (error) {
    console.log('Error Translating text:', error.message);
  }

  try{
    const client = new AzureOpenAI({ 
      endpoint: endpointAudio, 
      apiKey:apiKeyAudio, 
      apiVersion:apiVersionAudio, 
      deployment:'tts-hd' 
    });
    const streamToRead = await client.audio.speech.create({
      model: deploymentAudio,
      voice: "alloy",
      input: summaryTranslation,
    });
    console.log("Streaming response to downloads/translation_output.mp3");
    const buffer = Buffer.from(await streamToRead.arrayBuffer());
    await fs.promises.writeFile("./downloads/translation_output.mp3", buffer);
    console.log("Finished streaming");
    
  }catch(error){
    console.log("Error encountered in translated TTS: ",error.message,error);
  }
  res.status(200).json({transcriptionTranslation,summaryTranslation});
})

app.post('/chatbot',async(req,res)=>{
  try {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
    const chatbotResult = await client.chat.completions.create({
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
