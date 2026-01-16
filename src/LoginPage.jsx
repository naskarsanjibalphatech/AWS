import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Your original secret credentials + EV demo
  const SECRET_USER_ID = 'Office';
  const SECRET_PASSWORD = 'Office@100';

  const handleLogin = async () => {
    console.log('🔍 Login attempt:', { userId, password: '***' });
    
    // ✅ Admin login
    if (userId === 'admin' && password === 'admin123') {
      console.log('✅ Admin login SUCCESS');
      setError('');
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUserId', userId);
      localStorage.setItem('userRole', 'admin');
      
      onLoginSuccess();
      window.location.href = '/admin';
      return;
    }
    
    // ✅ Original Office login (your existing logic)
    if (userId === SECRET_USER_ID && password === SECRET_PASSWORD) {
      console.log('✅ Original Office login SUCCESS');
      setError('');
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUserId', userId);
      localStorage.setItem('userRole', 'user');
      
      onLoginSuccess();
      window.location.href = '/user-dashboard';
      return;
    }

    // ✅ EV API-4 login
    console.log('🔍 Trying API-4 login...');
    setLoading(true);
    setError('');

    try {
      const USER_API = "https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1";
      const payload = {
        action: "login",
        userId: userId,
        password: password
      };

      console.log('📡 API-4 POST:', payload);
      const response = await fetch(USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📡 API-4 Response:', data);

      if (response.ok && (data.success || data.userId || data.message === 'Login successful' || data.role)) {
        console.log('✅ API-4 login SUCCESS');
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('userRole', data.role || (userId.toLowerCase() === 'admin' ? 'admin' : 'user'));
        localStorage.setItem('userBalance', data.balance || '0');
        localStorage.setItem('loginTimestamp', Date.now().toString());
        
        onLoginSuccess();
        
        const targetRoute = data.role === 'admin' || userId.toLowerCase() === 'admin' ? '/admin' : '/user-dashboard';
        console.log('🚀 Redirecting to:', targetRoute);
        window.location.href = targetRoute;
      } else {
        console.log('❌ API-4 login FAILED');
        setError(data.message || 'Invalid EV credentials');
      }
    } catch (err) {
      console.error('💥 API-4 Network error:', err);
      setError('Network error or invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: '#ffffff',
  padding: '20px'
};


  const formContainerStyle = {
  backgroundColor: '#ffffff',
  padding: 'clamp(30px, 6vw, 50px)',
  borderRadius: '12px',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
  width: 'clamp(320px, 90vw, 500px)',
  maxWidth: '95%',
  border: '4px solid #000000'

};


  const headingStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: '28px',
    background: 'none',
WebkitTextFillColor: 'initial',

  };

  const errorStyle = {
    color: '#dc2626',
    marginBottom: '20px',
    textAlign: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '10px',
    color: '#374151',
    fontWeight: '600',
    fontSize: '15px'
  };

  const inputStyle = {
    width: '100%',
    padding: 'clamp(12px, 3vw, 16px) clamp(15px, 4vw, 20px)',
    marginBottom: '20px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    boxSizing: 'border-box',
    fontSize: 'clamp(14px, 3vw, 16px)',
    transition: 'all 0.3s ease',
    backgroundColor: 'white'
  };

  const buttonStyle = {
   background: '#000000',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    width: '100%',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
   boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
  };

  const handleMouseEnter = (e) => {
    e.target.style.background = '#111111';

    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.background = '#000000';

    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div 
  style={{
    width: 'auto',
    height: 'auto',
    background: 'transparent',
    margin: '0 auto 30px',
    padding: '0',
    boxShadow: 'none',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
            }}
            
          >
            <img 
  src="/logo_160126.jpeg" 
  alt="AlphaTech Solutions Logo"
  style={{ 
    width: '100%', 
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15))'
  }}
/>

          </div>
          <h2 style={{
            ...headingStyle,
            fontSize: 'clamp(24px, 5vw, 32px)',
            marginBottom: '12px'
          }}>EV CHARGING STATION</h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: 'clamp(13px, 3vw, 16px)', 
            margin: 0,
            fontWeight: '500'
          }}>
            Smart Charging Station Control
          </p>
        </div>

        {error && <p style={errorStyle}>{error}</p>}
        
        <div>
          <label style={labelStyle}>
            <User style={{ width: '18px', height: '18px', marginRight: '8px', verticalAlign: 'middle' }} />
            User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              ...inputStyle,
              borderColor: loading ? '#d1d5db' : '#000000',

              backgroundColor: loading ? '#f9fafb' : 'white'
            }}
            placeholder="admin, user1, or Office"
            disabled={loading}
          />
        </div>
        
        <div>
          <label style={labelStyle}>
            <Lock style={{ width: '18px', height: '18px', marginRight: '8px', verticalAlign: 'middle' }} />
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              ...inputStyle,
              borderColor: loading ? '#d1d5db' : '#000000',

              backgroundColor: loading ? '#f9fafb' : 'white'
            }}
            placeholder="Enter password"
            disabled={loading}
          />
        </div>
        
        <button
  onClick={handleLogin}
  disabled={loading}
  style={buttonStyle}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  {loading ? '🔄 Verifying...' : '⚡ LOGIN & CHARGE'}
</button>

<div
  style={{
    marginTop: '14px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#9ca3af'
  }}
>
  Design & Developed By{' '}
  <a
    href="https://www.alphatechsolutions.in"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: '#9ca3af',
      textDecoration: 'none',
      fontWeight: '500'
    }}
  >
    Alphatech Solutions
  </a>
</div>

</div>   {/* ← THIS closes formContainerStyle */}

    </div>
    
  );
};

export default LoginPage;