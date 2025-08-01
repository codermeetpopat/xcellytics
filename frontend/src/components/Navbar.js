import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "./llogo-6.png";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
    navigate("/");
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Excel Logo" className="logo-icon" />
        <span className="logo-text">Xcellytics</span>
      </div>
      <div className="navbar-links">
        {isAdmin ? (
          // Admin navigation
          <>
            <Link to="/admin-dashboard">User Management</Link>
            <span className="navbar-user admin-user">Admin: {user.name}</span>
            <button className="logout-btn admin-logout" onClick={handleLogout}>Admin Logout</button>
          </>
        ) : (
          // Regular user navigation
          <>
            <Link to="/">Home</Link>
            <Link to="/about">Features</Link>
            {!user ? (
              <>
                <Link to="/login">Login/Signup</Link>
                <Link to="/admin-login" className="admin-login-link">Admin Login</Link>
              </>
            ) : (
              <>
                <span className="navbar-user">Hello, {user.name}</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
