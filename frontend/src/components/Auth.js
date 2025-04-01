import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

const Auth = () => {
  const [user, setUser] = useState(null);
  const [showLogoutOptions, setShowLogoutOptions] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/");
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (error) {
      console.error("Failed to fetch user", error);
      setUser(null);
    }
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowLogoutOptions(false);
    navigate("/");
  };

  const handleProfileClick = (event) => {
    event.stopPropagation();
    setShowLogoutOptions((prev) => !prev);
  };

  useEffect(() => {
    if (showLogoutOptions) {
      document.addEventListener("click", () => setShowLogoutOptions(false));
    }
    return () => {
      document.removeEventListener("click", () => setShowLogoutOptions(false));
    };
  }, [showLogoutOptions]);

  return (
    <div className={styles.authContainer}>
      {user ? (
        <div className={styles.profileIconContainer} onClick={handleProfileClick}>
          <div className={styles.profileIcon}>
            <img src={user.photo} alt="profile" />
          </div>
          {showLogoutOptions && (
            <div className={styles.profileDropdown} ref={dropdownRef}>
              <p className={styles.email}>{user.email}</p>
              <img alt="profile" src={user.photo}></img>
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