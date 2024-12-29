import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <strong>VideoSummary.com</strong>
        </div>
        <div className={styles.links}>
          <a href="/privacy-policy" className={styles.link}>
            Privacy Policy
          </a>
          <a href="/terms-of-service" className={styles.link}>
            Terms of Service
          </a>
          <a href="/contact-us" className={styles.link}>
            Contact Us
          </a>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} VideoSummary.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
