import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import UserDashboard from './pages/home/User';
import AdminPanel from './pages/home/AdminPanel';
import OperatorDashboard from './pages/home/OperatorDashboard';
import RemoteUserDashboard from './pages/home/RemoteUserDashboard';
import { Wrapper } from './layouts/Wrapper';
import "src/styles/index.css";

function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage on initial load
    const stored = localStorage.getItem('isLoggedIn') === 'true';
    console.log('🔍 App Initial Load - isLoggedIn from localStorage:', stored);
    return stored;
  });

  const [userRole, setUserRole] = useState(() => {
    // Check localStorage on initial load
    const role = localStorage.getItem('userRole');
    console.log('🔍 App Initial Load - userRole from localStorage:', role);
    return role;
  });

  // ============================================
  // HANDLE LOGIN SUCCESS CALLBACK
  // ============================================
  const handleLoginSuccess = (role, user) => {
    console.log('=== handleLoginSuccess CALLED ===');
    console.log('Role received:', role);
    console.log('User data received:', user);

    // Update state
    setIsLoggedIn(true);
    setUserRole(role);

    // Verify localStorage was set by LoginPage
    console.log('📝 Checking localStorage:');
    console.log('isLoggedIn:', localStorage.getItem('isLoggedIn'));
    console.log('userRole:', localStorage.getItem('userRole'));
    console.log('currentUserId:', localStorage.getItem('currentUserId'));
  };

  // ============================================
  // LOG STATE CHANGES
  // ============================================
  useEffect(() => {
    console.log('🔄 App state changed:');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('userRole:', userRole);
  }, [isLoggedIn, userRole]);

  console.log('📱 App render - isLoggedIn:', isLoggedIn, 'userRole:', userRole);

  return (
    <Router>
      <Routes>
        {/* ============================================ */}
        {/* ROOT ROUTE - REDIRECT LOGIC */}
        {/* ============================================ */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              userRole === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/user-dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ============================================ */}
        {/* LOGIN ROUTE */}
        {/* ============================================ */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              userRole === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/user-dashboard" replace />
              )
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* ============================================ */}
        {/* USER DASHBOARD ROUTE */}
        {/* ============================================ */}
        <Route
  path="/user-dashboard"
  element={
    isLoggedIn && userRole !== 'admin' ? (
      userRole === 'operator' ? (
  <OperatorDashboard />
) : userRole === 'remote' ? (
  <RemoteUserDashboard />
) : (
  <UserDashboard />
)
    ) : isLoggedIn && userRole === 'admin' ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>
        {/* ============================================ */}
        {/* ADMIN PANEL ROUTE */}
        {/* ============================================ */}
        <Route
          path="/admin"
          element={
            isLoggedIn && userRole === 'admin' ? (
              <AdminPanel />
            ) : isLoggedIn && userRole !== 'admin' ? (
              <Navigate to="/user-dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ============================================ */}
        {/* WRAPPER ROUTE (BACKWARD COMPATIBILITY) */}
        {/* ============================================ */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Wrapper />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ============================================ */}
        {/* 404 - NOT FOUND */}
        {/* ============================================ */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;