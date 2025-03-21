import React, { useState,useRef,useEffect } from "react";
import styles from "./ChatComponent.module.css";
import sparkle from "../assets/sparkle.svg"; // MUI or Lucide React for sparkle icon
import SendButton from "../assets/svg/SendButton";
import BotMessage from "./BotMessage";


const ChatComponent = () => {

  const [messages,setMessages] = useState([
    { text: "Hello! How can I assist you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);



  // Handle user input
  const  handleSend = async() => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    
    try{
        const response = await fetch('http://localhost:5000/chatbot',{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: input }),
        });
        const data = await response.json();
        const botReply = { text: data.output, sender: "bot" };
        console.log(botReply);
        setMessages((prevMessages)=>[...prevMessages,botReply]);

    }catch(e){
        console.log(e.message);
        setTimeout(() => {
            const botReply = { text: "Chatbot Error", sender: "bot" };
            setMessages((prevMessages) => [...prevMessages, botReply]);
        }, 1000);

    }

    
  };

  

  useEffect(() => {
    const chatWindow = document.querySelector(`.${styles.chatMessages}`);
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll inside the chat window
    }
  }, [messages]);


  
  

  return (
    <div className={styles.chatContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <img size={20} alt="sparkle" className={styles.sparkleIcon} src={sparkle} />
      </div>

      {/* Chat Messages */}
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "user" ? styles.userMessage : ""}>
            {msg.sender === "bot" ? <BotMessage msg={msg.text}/> : msg.text}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Chat Input */}
      <div className={styles.chatInputContainer}>
        <input type="text"
         className={styles.chatInput}
         placeholder="Type here..."
         value={input}
         onChange={(e)=>setInput(e.target.value)}
         onKeyDown={(e)=>e.key === "Enter" && handleSend()}
        />
        <button className={styles.sendButton} onClick={handleSend}><SendButton/></button>
      </div>
    </div>
  );
};

export default ChatComponent;
