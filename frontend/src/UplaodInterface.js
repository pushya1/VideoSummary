import { useState,useRef } from 'react';
import styles from './UploadInterface.module.css';
import Body from './components/Body';

const UploadInterface = () => {
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null); // Store the actual file object
  const [transcription, setTranscription] = useState(''); // Store the transcription result
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [summary,setSummary] = useState('');
  const [audioSrc, setAudioSrc] = useState('http://localhost:5000/stream-audio'); // Audio source state
  const audioRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile); // Save the file for later use
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setTranscription(''); // Clear previous transcription result
    setSummary(''); //clear previous summary result

    const formData = new FormData();
    formData.append('audio', file); // Append the file to the form data

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setTranscription(data.transcription); // Update with transcription result
      if(data.summarization){
        setSummary(data.summarization);
      }
      const newSrc = `http://localhost:5000/stream-audio?timestamp=${Date.now()}`;
      setAudioSrc(newSrc);
      // Ensure the audio element reloads
      if (audioRef.current) {
        audioRef.current.load();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setTranscription('Error occurred while processing the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Main Content */}
      <main className={styles.child}>
        <div className={styles.description}>
          upload a Video or an Audio file for summary.
        </div>
        <label htmlFor="file-upload" className={styles.uploadButton}>
          <input
            id="file-upload"
            type="file"
            accept="audio/mp3"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
          <span>📤 Click to upload</span>
        </label>
        {fileName && <div className={styles.fileName}>File Selected: {fileName}</div>}
        <button
          className={styles.actionButton}
          disabled={!file || isLoading}
          onClick={handleFileUpload}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
        {transcription && (
          <Body transcription={transcription} summary={summary} audioSrc={audioSrc} audioRef={audioRef}/>
        )}
        
      </main>

    </div>
  );
};

export default UploadInterface;
