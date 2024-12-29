
## **VideoSummary**  
**A web application that transcribes, summarizes, and converts video/audio content into text and speech.**  

### **Features:**  
- **Audio Transcription:** Converts uploaded audio/video files into text using Azure OpenAI's Whisper model.  
- **Text Summarization:** Summarizes transcribed content with GPT-4 for concise understanding.  
- **Text-to-Speech (TTS):** Converts summarized text back into high-quality audio using Azure OpenAI's TTS HD model.  
- **Streaming Support:** Enables real-time audio streaming of generated summaries.  
- **File Upload:** Simple and secure audio file upload through the web interface.  

### **Technology Stack:**  
- **Frontend:** React (for an intuitive user interface).  
- **Backend:** Node.js with Express.js.  
- **Azure Services:**  
  - Azure OpenAI's Whisper model for transcription
  - Azure OpenAI's GPT-4 model for Summarization.  
  - Azure OpenAI's Text-to-Speech(tts-hd) model for audio generation.  
- **File Handling:** Multer for file uploads, and FS for file management.  

### **Usage:**  
This project is ideal for simplifying content from lengthy audio/video files into manageable summaries, particularly for busy professionals, educators, and students.

---

