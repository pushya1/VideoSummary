import React, { useEffect, useState,useRef } from "react";
import styles from './Auth.module.css';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [user, setUser] = useState(null);
  const [showLogoutOptions, setShowLogoutOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.displayName) setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleLogout = () => {
    fetch("http://localhost:5000/logout", {
      credentials: "include",
    }).then(() => {
      setUser(null);
      setShowLogoutOptions(false);
      });
    window.location.href = "/";
  };

  const handleProfileClick = (event) => {
    event.stopPropagation(); // Prevents immediate closing when clicking the profile
    setShowLogoutOptions((prev) => !prev);
  };

  const handleClickOutside = () => {
    setShowLogoutOptions(false);
  };

  useEffect(() => {
    if (showLogoutOptions) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showLogoutOptions]);


  return (
    <div className={styles.authContainer}> {/* Added a container for potential layout */}
      {user ? (
        <div
          className={styles.profileIconContainer} 
          onClick={handleProfileClick}
          style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
        >
          <div className={styles.profileIcon}>
            <img src={user.photos[0].value} alt="profile" />
          </div>
          {showLogoutOptions && (
            <div className={styles.profileDropdown} ref={dropdownRef}>
              <p className={styles.email}>{user._json.email}</p>
              <img alt="profile" src={user.photos[0].value}></img>
              <p className={styles.name}>Hi, {user.displayName}</p>
              <button onClick={handleLogout}>Sign Out</button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={handleLogin} className={styles.signin}>Sign in</button>
      )}
    </div>
  );
};

export default Auth;
