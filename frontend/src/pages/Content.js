import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import TranscriptionSummary from '../components/TranscriptionSummary';
import ChatComponent from '../components/ChatComponent'
import styles from './Content.module.css'
const Content = () => {
  const location = useLocation();
  const { transcription, summary, date, name, videoKey } = location.state || {};

  return (      
    <>
        <Header/>
        <div className={styles.container}>
            <div className={styles.transcriptionSummary}>
                <TranscriptionSummary 
                    title={name}
                    date={date}
                    tag="Work"
                    transcription={transcription}
                    summary={summary}
                    image="https://example.com/meeting.jpg"
                    videoKey={videoKey}
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
