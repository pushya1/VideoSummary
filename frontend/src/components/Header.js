import React from 'react';
import styles from './Header.module.css';
import Logo from "../assets/logo.svg"; 
import Auth from "./Auth.js";


const Header = () => {
  return (
    <div className={styles.header}>
        <img src={Logo} alt="Mondly Logo" className={styles.logo} />
        <Auth className={styles.profileIcon}/>
    </div>
  );
};

export default Header;
