import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import TranscriptionSummary from '../components/TranscriptionSummary';
import ChatComponent from '../components/ChatComponent'
import styles from './Content.module.css'
const Content = () => {
  const location = useLocation();
  const { transcription, summary } = location.state || {};

  return (
    <>
        <Header/>
        <div className={styles.container}>
            <div className={styles.transcriptionSummary}>
                <TranscriptionSummary 
                    title="Team Meeting"
                    date="3/5/2025, 10:00 AM"
                    tag="Work"
                    transcription={transcription}
                    summary={summary}
                    image="https://example.com/meeting.jpg"
                />
            </div>
            <div className={styles.chatComponent}>
                <ChatComponent/>
            </div>
        </div>

        
    </>
    
  );
};

export default Content;
