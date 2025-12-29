// src/pages/home/Wrapper.jsx - CHARGING TAB REMOVED
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AlphatechChargingStation from './Body';
import AdminPage from './AdminPage';

const Wrapper = () => {
  const userRole = localStorage.getItem('userRole') || 'user';
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Routes>
        {/* Charging Station */}
        <Route path="/" element={<AlphatechChargingStation />} />
        {/* Admin Panel */}
        <Route path="/admin" element={userRole === 'admin' ? <AdminPage /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={<Navigate to="/" />} />
      </Routes>

      {/* ADMIN TOP MENU - CHARGING TAB REMOVED */}
      {userRole === 'admin' && (
        <div style={{ 
          position: 'fixed', top: '20px', right: '20px', 
          background: 'white', padding: '15px 25px', 
          borderRadius: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          fontWeight: 'bold', fontSize: '16px'
        }}>
          <a href="/dashboard/admin" style={{ 
            color: location.pathname === '/dashboard/admin' ? '#007bff' : '#333', 
            textDecoration: 'none'
          }}>
            🔧 Admin
          </a>
        </div>
      )}
    </div>
  );
};

export default Wrapper;
