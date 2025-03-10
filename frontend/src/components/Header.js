import React from 'react';
import styles from './Header.module.css';
import Logo from "../assets/logo.svg"; 





const Header = () => {
  return (
    <div className={styles.header}>
        <img src={Logo} alt="Mondly Logo" className={styles.logo} />
        <div className={styles.profileIcon}></div>
      </div>
  );
};

export default Header;
