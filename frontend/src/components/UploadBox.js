import styles from "./UploadBox.module.css";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import animation from "../assets/animation.gif";
import draganddrop from "../assets/draganddrop.svg";
import uploadIcon from "../assets/uploadIcon.svg";
import Progress from "./Progress.js";

export default function UploadBox() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

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
    formData.append("audio", file);

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Please sign in to upload");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_UPLOAD_URL}`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        setErrorMessage("Unauthorized. Please sign in again.");
        localStorage.removeItem("token");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      navigate("/content", { state: { transcription: data.transcription, summary: data.summary, date: data.currentDateString, name: data.name, videoKey: data.videoKey } });
      if (audioRef.current) {
        audioRef.current.load();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage("Upload failed. Please try again.");
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
            {isLoading ? (
              <img src={animation} alt="Uploading..." />
            ) : (
              <img src={draganddrop} alt="Drag and Drop" />
            )}
          </label>
        </div>

        <div className={styles.upload}>
          {isLoading ? (
            <Progress />
          ) : (
            <button
              className={`${styles.button} ${file && styles.active}`}
              onClick={handleFileUpload}
            >
              <img src={uploadIcon} alt="Upload" />
              <h4>Upload</h4>
            </button>
          )}
        </div>
      </div>

      {file && <p className={styles.fileName}>Selected: {file.name}</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </>
  );
}