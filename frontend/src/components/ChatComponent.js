import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatComponent.module.css";
import sparkle from "../assets/sparkle.svg";
import SendButton from "../assets/svg/SendButton";
import BotMessage from "./BotMessage";

const ChatComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessages((prev) => [...prev, { text: "Please sign in to chat.", sender: "bot" }]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_CHAT_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.status === 401) {
        setMessages((prev) => [...prev, { text: "Session expired. Please sign in again.", sender: "bot" }]);
        return;
      }

      const data = await response.json();
      const botReply = { text: data.output, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botReply]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { text: "Chatbot Error. Please try again.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const chatWindow = document.querySelector(`.${styles.chatMessages}`);
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <img alt="sparkle" className={styles.sparkleIcon} src={sparkle} />
      </div>

      {/* Chat Messages */}
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "user" ? styles.userMessage : ""}>
            {msg.sender === "bot" ? <BotMessage msg={msg.text} /> : msg.text}
          </div>
        ))}
        {isLoading && <BotMessage msg={"..."} isPreparing={isLoading} />}
        <div ref={chatEndRef}></div>
      </div>

      {/* Chat Input */}
      <div className={styles.chatInputContainer}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="Type here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          <SendButton />
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
