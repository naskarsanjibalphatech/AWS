import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import UserDashboard from './pages/home/User';
import AdminPanel from './pages/home/AdminPanel';
import { Wrapper } from './layouts/Wrapper';
import "src/styles/index.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = () => {
    console.log('✅ App: Login success - setting isLoggedIn=true');
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  console.log('🔍 App render - isLoggedIn:', isLoggedIn);

  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/user-dashboard" : "/login"} replace />}
        />
        
        {/* Login */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        
        {/* EV User Dashboard */}
        <Route
          path="/user-dashboard"
          element={isLoggedIn ? <UserDashboard /> : <Navigate to="/login" />}
        />
        
        {/* EV Admin Panel */}
        <Route
          path="/admin"
          element={
            isLoggedIn && localStorage.getItem('userRole') === 'admin' 
              ? <AdminPanel /> 
              : <Navigate to="/login" />
          }
        />
        
        {/* Original Wrapper (for backward compatibility) */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
