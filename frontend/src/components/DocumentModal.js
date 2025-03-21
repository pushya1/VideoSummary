import React from "react";
import ReactDOM from "react-dom";
import styles from "./DocumentModal.module.css";

const DocumentModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>✖</button>
        <div className={styles.content}>
          {children} {/* Display document-style content here */}
        </div>
      </div>
    </div>,
    document.body) 
  );
};

export default DocumentModal;
