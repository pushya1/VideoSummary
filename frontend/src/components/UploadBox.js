import styles from "./UploadBox.module.css";
import React, { useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import animation from "../assets/animation.gif";
import draganddrop from "../assets/draganddrop.svg";
import uploadIcon from "../assets/uploadIcon.svg";
import Progress from "./Progress.js";

export default function UploadBox() {
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();


  const [file, setFile] = useState(null);

  // Handle file selection from input
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle Drag & Drop
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_UPLOAD_URL}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      navigate("/content", { state: { transcription: data.transcription, summary: data.summarization } });
            if (audioRef.current) {
        audioRef.current.load();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <>
      <div className={styles.uploadContainer}>

        <div className={styles.select}>
          <input
            type="file"
            accept="audio/*,video/*"
            className={styles.hiddenInput}
            id="file-upload"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className={styles.uploadBox}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
          {isLoading ? <img src={animation} alt="Robo animation"/> : <img src={draganddrop} alt="DragandDrop"/>}
          </label>
          
        </div>

        <div className={styles.upload}>
          {isLoading ? (<Progress/>) : (<button className={`${styles.button} ${file && styles.active}`} onClick={handleFileUpload}><img src={uploadIcon} alt="uploadicon"/><h4>Upload</h4></button>) }
        </div>

      </div>

      {file && <p className={styles.fileName}>Selected: {file.name}</p>}
    </>
  );
}
