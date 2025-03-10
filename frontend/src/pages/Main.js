import React from "react";
import styles from "./Main.module.css"; 
import Sparkle from "../assets/sparkle.svg";
import UploadBox from "../components/UploadBox.js"
import Footer from "../components/Footer.js";
import Header from "../components/Header.js";
const Main = () => {
  return (
    <>
    <div className={styles.container}>

      {/* Header */}
      <Header/>

      {/* {Upload Section} */}
      <UploadBox/>

      {/* Chat Greeting */}
      <div className={styles.chatSection}>
        <img src={Sparkle} alt="Sparkle" className={styles.sparkle} />
        <h2>
          Hello <span className={styles.name}>Chris</span>,
        </h2>
        <p>What can I help you with?</p>
      </div>

    </div>
    
    <Footer/>
    </>
  );
};

export default Main;
