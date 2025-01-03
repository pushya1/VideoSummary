import styles from './Body.module.css';

const Body = ({ transcription, summary, audioSrc, audioRef }) => {
  return (
    <div className={styles.bodyContainer}>
      {transcription && (
        <div className={styles.transcription}>
          <h3>Transcription</h3>
          <p>{transcription}</p>
        </div>
      )}
      {summary && (
        <div className={styles.summary}>
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}

      {audioSrc && (
        <audio id="audioPlayer" ref={audioRef} controls className={styles.audioPlayer}>
        <source src={audioSrc} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      )}
      
    </div>
  );
};

export default Body;
