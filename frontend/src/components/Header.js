import React from 'react';
import styles from './Header.module.css';
import logo from '../assets/logo.png';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';



const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>VideoSummary.com</h1>
      </div>
      <nav className={styles.nav}>
        <Box sx={{ '& > :not(style)': { m: 1 } }}>
        <Button variant="text" href='/about'>About</Button>
        <Button variant="text" href='/contact'>Contact</Button>
        
        </Box>
      </nav>
    </header>
  );
};

export default Header;
