import { useState,useRef } from "react";
import Voice from "../assets/svg/Voice";
import Spinner from "../assets/svg/Spinner";
import Stop from "../assets/svg/Stop";
import styles from './BotMessage.module.css';
import { PulseLoader } from "react-spinners";

export default function BotMessage({msg,isPreparing}){
    const [audioSrc,setAudioSrc] = useState(null);
    const [isLoading,setIsLoading] = useState(false);
    const [isPlaying,setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    async function handlePlay(msg){
        if (isPlaying && audioRef.current) {
          // **Stop audio if already playing**
          audioRef.current.pause();
          audioRef.current.currentTime = 0; // Reset to start
          setIsPlaying(false);
          return;
        }
        try{
          setIsLoading(true);
          const response = await fetch(`${process.env.REACT_APP_VOICE_URL}`,{
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({text:msg}),
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

    let pulseLoader = (<PulseLoader size={10} />);

    const result =  (<>
                      {audioSrc && <audio autoPlay ref={audioRef} src={audioSrc} onEnded={handleAudioEnd} />}
                      <button className={styles.expandButton} onClick={()=>handlePlay(msg)}>
                          {isLoading ? <Spinner/> : isPlaying ? <Stop/> : <Voice/>}
                      </button>
                    </>)
            
    return(
        <div className={styles.botMessage}>  

            {isPreparing ? pulseLoader : msg}
            {msg.length>100 && result}
            
        </div>
    )
    

}