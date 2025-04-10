import React, { useState, useRef } from "react";
import styles from "./TranscriptionSummary.module.css";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import thumbnail from "../assets/meeting.jpeg";
import Voice from "../assets/svg/Voice";
import Spinner from "../assets/svg/Spinner";
import Stop from "../assets/svg/Stop";
import DocumentModal from "./DocumentModal";

const TranscriptionSummary = ({ title, date, tag, transcription, summary, image,videoKey }) => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef(null);

  async function handlePlay() {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Please sign in to use text-to-speech.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_VOICE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: summary }),
      });

      if (response.status === 401) {
        console.error("Session expired. Please sign in again.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch audio");

      const audioUrl = URL.createObjectURL(await response.blob());
      setAudioSrc(audioUrl);
      setIsLoading(false);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsLoading(false);
    }
  }

  function handleAudioEnd() {
    setIsPlaying(false);
  }

  function clickHandler(){
    window.open(`${process.env.REACT_APP_BUCKET_URL}/${videoKey}`, '_blank');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.thumbnailBorder}>
          {image && <img src={thumbnail} alt="File" className={styles.meetingImage} onClick={clickHandler} />}
        </div>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.date}>{date}</p>
          <div className={styles.tags}>
            <span className={styles.tag}>{tag}</span>
            <button className={styles.addTag}>+ Add tag</button>
          </div>
        </div>
      </div>

      {/* Transcription Section */}
      <div className={styles.transcriptionBox}>
        <h3 className={styles.sectionTitle}>Transcription</h3>
        <p className={styles.text}>{transcription}</p>
        <button className={styles.expandButton} onClick={() => setIsOpen(true)}>
          <OpenInFullRoundedIcon size={18} />
        </button>
        <DocumentModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <h2>Transcription</h2>
          <p>{transcription}</p>
        </DocumentModal>
      </div>

      {/* Summary Section */}
      <div className={styles.summaryBox}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <p className={styles.text}>{summary}</p>
        {audioSrc && <audio autoPlay ref={audioRef} src={audioSrc} onEnded={handleAudioEnd} />}
        <button className={styles.expandButton} onClick={handlePlay}>
          {isLoading ? <Spinner /> : isPlaying ? <Stop /> : <Voice />}
        </button>
      </div>
    </div>
  );
};

export default TranscriptionSummary;
