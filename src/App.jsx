// App.jsx - FIXED ROUTING (CORRECT VERSION)
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import Wrapper from './pages/home/Wrapper';
import "src/styles/index.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        
        {/* PROTECTED ROUTES - SIMPLIFIED WITH WILDCARD */}
        <Route path="/dashboard/*" element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
