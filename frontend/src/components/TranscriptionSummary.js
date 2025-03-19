import React, { useState,useRef } from "react";
import styles from "./TranscriptionSummary.module.css"; // Import CSS Module
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import thubnail from '../assets/meeting.jpeg';
import Voice from '../assets/svg/Voice';
import Spinner from "../assets/svg/Spinner";
import Stop from "../assets/svg/Stop";

const TranscriptionSummary = ({ title, date, tag, transcription, summary, image }) => {
  const [audioSrc,setAudioSrc] = useState(null);
  const [isLoading,setIsLoading] = useState(false);
  const [isPlaying,setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  async function handlePlay(){
    if (isPlaying && audioRef.current) {
      // **Stop audio if already playing**
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset to start
      setIsPlaying(false);
      return;
    }
    try{
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/stream",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({text:summary}),
      })
      if(!response.ok) throw new Error("Failed to fetch audio");
      const audioUrl = URL.createObjectURL(await response.blob());
      setAudioSrc(audioUrl);
      setIsLoading(false);
      setIsPlaying(true);
    }catch(error){
      console.error("Error playing audio:",error);
      setIsLoading(false);
    }
    
  }

  function handleAudioEnd(){
    setIsPlaying(false);
  }
  return (
    <div className={styles.container}>
      {/* Meeting Header */}
      <div className={styles.header}>
        <div className={styles.thumbnailBorder}>
            {image && <img src={thubnail} alt="Meeting" className={styles.meetingImage} />}
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
        <button className={styles.expandButton}>
          <OpenInFullRoundedIcon size={18} />
        </button>
      </div>

      {/* Summary Section */}
      <div className={styles.summaryBox}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <p className={styles.text}>{summary}</p>
        {audioSrc && <audio autoPlay ref={audioRef} src={audioSrc} onEnded={handleAudioEnd} />}
        <button className={styles.expandButton} onClick={handlePlay}>
          {isLoading ? <Spinner/> : isPlaying ? <Stop/> : <Voice/>}
        </button>
      </div>
    </div>
  );
};

export default TranscriptionSummary;
