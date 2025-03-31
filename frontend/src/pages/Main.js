import React, { useState,useEffect } from "react";
import styles from "./Main.module.css"; 
import Sparkle from "../assets/sparkle.svg";
import UploadBox from "../components/UploadBox.js"
import Footer from "../components/Footer.js";
import Header from "../components/Header.js";
const Main = () => {
 const [userName,setUserName] = useState("");
  useEffect(() => {
    fetch("http://localhost:5000/user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.displayName) setUserName(data.name.givenName);
      })
      .catch(() => setUserName(null));
  }, []);

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
          Hello <span className={styles.name}>{userName ? userName : 'there'}</span>,
        </h2>
        <p>What can I help you with?</p>
      </div>

    </div>
    
    <Footer/>
    </>
  );
};

export default Main;
