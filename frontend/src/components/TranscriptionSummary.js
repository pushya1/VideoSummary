import React from "react";
import styles from "./TranscriptionSummary.module.css"; // Import CSS Module
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import thubnail from '../assets/meeting.jpeg';


const TranscriptionSummary = ({ title, date, tag, transcription, summary, image }) => {
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
      </div>
    </div>
  );
};

export default TranscriptionSummary;
