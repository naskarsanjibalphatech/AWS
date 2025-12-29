// src/LoginPage.jsx - BYPASS API FOR USERS
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId || !password) {
      setError('Please enter User ID and Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ADMIN LOGIN - Real API check
      if (userId === 'admin') {
        const payload = { action: 'login', userId, password };
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          throw new Error('Admin password wrong. Use: admin123');
        }
        const data = await res.json();
      }
      // USER LOGIN - Skip API (direct login)
      else {
        console.log('✅ User login OK:', userId);
      }

      // Login success
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', userId === 'admin' ? 'admin' : 'user');
      
      onLoginSuccess();
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div style={{ 
        background: 'white', padding: '40px', borderRadius: '15px', 
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)', width: '400px' 
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '28px' }}>
          🔌 EV Charging Login
        </h2>
        
        {error && <div style={{ color: '#dc3545', padding: '10px', background: '#f8d7da', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
        
        <input 
          placeholder="User ID (user1 or admin)" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          style={{ width: '100%', padding: '15px', marginBottom: '15px', border: '2px solid #ddd', borderRadius: '8px' }} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '15px', marginBottom: '20px', border: '2px solid #ddd', borderRadius: '8px' }} 
        />
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ 
            width: '100%', padding: '15px', background: '#28a745', color: 'white', 
            border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold',
            opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <div><strong>User:</strong> user1 / anypassword</div>
          <div><strong>Admin:</strong> admin / admin123</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
