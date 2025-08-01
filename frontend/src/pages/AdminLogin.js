import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdminLogin.css";

function AdminLogin({ setUser }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:1000/api/auth/admin-login", credentials);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", response.data.role);
        setUser({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        });
        navigate("/admin-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>
          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
        <div className="back-to-user">
          <button onClick={() => navigate("/login")} className="back-btn">
            Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
