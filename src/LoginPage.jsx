import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // **Here's where you set your secret words!**
  const SECRET_USER_ID = 'kiswok';
  const SECRET_PASSWORD = 'K@123';

  const handleLogin = () => {
   if (userId === SECRET_USER_ID && password === SECRET_PASSWORD) {
  setError('');
  localStorage.setItem('isLoggedIn', 'true'); // ✅ persist login
  onLoginSuccess();
  navigate('/dashboard');
}
 
    else {
      setError('Invalid Credentials. Please try again.');
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f6f8', // Light gray background
  };

  const formContainerStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '400px', // Set a fixed width for the form
    maxWidth: '90%', // Ensure it's responsive on smaller screens
  };

  const headingStyle = {
    textAlign: 'center',
    marginBottom: '25px',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '24px',
  };

  const errorStyle = {
    color: '#d32f2f', // Red color for error
    marginBottom: '15px',
    textAlign: 'center',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: 'medium',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box', // Ensure padding doesn't increase width
    fontSize: '16px',
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
    fontWeight: 'medium',
    transition: 'background-color 0.3s ease', // Add a hover effect
  };

  const buttonHoverStyle = {
    backgroundColor: '#0056b3',
  };

  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = buttonStyle.backgroundColor;
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={headingStyle}>Login</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <div>
          <label style={labelStyle}>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button
          onClick={handleLogin}
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default LoginPage;