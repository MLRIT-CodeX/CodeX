import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && form.password !== form.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    const url = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";

    try {
      const response = await axios.post(url, form);
      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        response.data.role === "admin"
          ? navigate("/admin-home")
          : navigate("/student-home");
      } else {
        alert("Registration successful!");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Navigation Bar */}
      <div className="auth-nav">
          <Link to="/" className="go-back-btn">
            <svg className="back-arrow" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Go Back
          </Link>
      </div>

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="logo-icon">
            <span>M</span>
          </div>
          <span className="logo-text">MLRIT Code Hub</span>
        </Link>

        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? "Sign in to continue to MLRIT Code Hub"
              : "Join MLRIT Code Hub and start coding"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
            <div className="form-group">
            <input
                type="text"
                className="form-input"
                id="name"
                placeholder=" "
              value={form.name}
              onChange={handleChange}
              required
            />
              <label htmlFor="name" className="form-label">Full name</label>
              <div className="form-highlight"></div>
            </div>
        )}

          <div className="form-group">
        <input
              type="email"
              className="form-input"
              id="email"
              placeholder=" "
          value={form.email}
          onChange={handleChange}
          required
        />
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="form-highlight"></div>
          </div>

          <div className="form-group">
        <input
          type="password"
              className="form-input"
              id="password"
              placeholder=" "
          value={form.password}
          onChange={handleChange}
          required
        />
            <label htmlFor="password" className="form-label">Password</label>
            <div className="form-highlight"></div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  id="confirmPassword"
                  placeholder=" "
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                <div className="form-highlight"></div>
              </div>

              <div className="form-group">
                <select
                  className="form-input"
                  id="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                <label htmlFor="role" className="form-label">Role</label>
                <div className="form-highlight"></div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  id="rollNumber"
                  placeholder=" "
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="rollNumber" className="form-label">Roll Number</label>
                <div className="form-highlight"></div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  I agree to the Terms and Conditions
                </label>
              </div>
            </>
          )}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {isLogin ? "Sign in" : "Create account"}
                <svg className="button-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33337 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3.33331L12.6667 7.99998L8 12.6666" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
      </form>

        <div className="auth-links">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          {isLogin ? (
            <Link to="/register?college=&year=&department=" className="auth-link">
              Sign up
              <svg className="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ) : (
            <button type="button" onClick={() => setIsLogin(true)} className="auth-link">
              Sign in
              <svg className="link-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;