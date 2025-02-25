import React, { useState, useRef, useEffect } from "react";
import styles from "./Chatbot.module.css"; // Import CSS module

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you?", sender: "AI assist" },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Handle user input
  const  handleSend = async() => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    
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

    }finally{
        setInput("");
    }

    
  };

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatbotContainer}>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button className={styles.chatToggleBtn} onClick={() => setIsOpen(true)}>
          💬 Chat
        </button>
      )}

      {/* Chatbot Window */}
      <div className={`${styles.chatbot} ${isOpen ? styles.open : ""}`}>
        <div className={styles.chatHeader}>
          <span>Chatbot</span>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✖</button>
        </div>

        <div className={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className={styles.chatInput}>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
