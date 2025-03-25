import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import styles from "./Progress.module.css"; // Import CSS module

const Progress = () => {
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(()=>{
    const timeoutId = setTimeout(()=>{
        setIsUploaded(true);
      },10000);

      return ()=>clearTimeout(timeoutId);
  },[]);
  

  return (
    <div className={styles.progressContainer}>

      <div className={styles.progressStep}>
        {isUploaded ? <>
            <FaCheckCircle className={styles.completedIcon} />
            <span className={styles.activeText}>Uploaded</span>
        </> : <>
            <ImSpinner2 className={styles.spinner} />
            <span className={styles.activeText}>Uploading..</span>
        </>}
      </div>

      <div className={styles.progressLine}></div>

      <div className={styles.progressStep}>
        {isUploaded ? (<>
          <ImSpinner2 className={styles.spinner} />
          <span className={styles.activeText}>Transcribing..</span>
          </>) : ( <>
            <FaCheckCircle className={ styles.inactiveIcon}/>
            <span className={styles.inactiveText}>Transcribe</span>
            </> )
        }
      </div>

      <div className={styles.progressLine}></div>

      <div className={styles.progressStep}>
        <FaCheckCircle className={styles.inactiveIcon}/>
        <span className={styles.inactiveText}>
          Completed
        </span>
      </div>

    </div>
  );
};

export default Progress;
