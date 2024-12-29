import React from 'react';
import styles from './Header.module.css';
import logo from '../assets/logo.png';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>VideoSummary.com</h1>
      </div>
      <nav className={styles.nav}>
        <a href="/" className={styles.navLink}>Home</a>
        <a href="/about" className={styles.navLink}>About</a>
        <a href="/contact" className={styles.navLink}>Contact</a>
      </nav>
    </header>
  );
};

export default Header;
