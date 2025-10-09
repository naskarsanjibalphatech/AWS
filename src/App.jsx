import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import { Wrapper } from 'src/layouts/Wrapper';
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
        {/* Redirect root "/" based on login state */}
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        
        {/* Protected Routes - All dashboard pages */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/live-data"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/live-trends"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/alert-log"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/threshold"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
        <Route
          path="/historical-trends"
          element={isLoggedIn ? <Wrapper /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
