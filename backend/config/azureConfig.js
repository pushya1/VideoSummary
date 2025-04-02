const { AzureOpenAI } = require("openai");
require("dotenv").config();

const transcribeClient = new AzureOpenAI({
  endpoint: process.env.endpointWhisper,
  apiKey: process.env.apiKeyWhisper,
  apiVersion: "2024-06-01",
  deployment: "whisper",
});

const streamClient = new AzureOpenAI({
  endpoint: process.env.endpointAudio,
  apiKey: process.env.apiKeyAudio,
  apiVersion: "2024-05-01-preview",
  deployment: "tts-hd",
});

const chatClient = new AzureOpenAI({
  endpoint: process.env.endpoint,
  apiKey: process.env.apiKey,
  apiVersion: "2024-08-01-preview",
  deployment: "gpt-35-turbo-16k",
});

module.exports = { transcribeClient, streamClient, chatClient };
