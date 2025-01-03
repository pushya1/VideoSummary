import { useState, useRef } from 'react';
import styles from './UploadInterface.module.css';
import Body from './components/Body';

const UploadInterface = () => {
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [audioSrc, setAudioSrc] = useState('http://localhost:5000/stream-audio');
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setTranscription('');
    setSummary('');

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      if (data.summarization) {
        setSummary(data.summarization);
      }
      const newSrc = `http://localhost:5000/stream-audio?timestamp=${Date.now()}`;
      setAudioSrc(newSrc);
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

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFileName(droppedFile.name);
      setFile(droppedFile);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.child}>
        <div className={styles.description}>
          Upload a Video or an Audio file for summary.
        </div>
        <label
          htmlFor="file-upload"
          className={`${styles.uploadButton} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
          <Body transcription={transcription} summary={summary} audioSrc={audioSrc} audioRef={audioRef} />
        )}
      </main>
    </div>
  );
};

export default UploadInterface;
