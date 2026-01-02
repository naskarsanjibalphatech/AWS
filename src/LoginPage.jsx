import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Your original secret credentials + EV demo
  const SECRET_USER_ID = 'Office';
  const SECRET_PASSWORD = 'Office@100';

  const handleLogin = async () => {
    console.log('🔍 Login attempt:', { userId, password: '***' });
    
    // ✅ Original Office login (your existing logic)
    if (userId === SECRET_USER_ID && password === SECRET_PASSWORD) {
      console.log('✅ Original Office login SUCCESS');
      setError('');
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUserId', userId);
      localStorage.setItem('userRole', 'user'); // Office = regular user
      
      onLoginSuccess();
      navigate('/user-dashboard');
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

      // ✅ FIXED: Matches YOUR API response {message: 'Login successful', role: 'admin'}
      if (response.ok && (data.success || data.userId || data.message === 'Login successful' || data.role)) {
        console.log('✅ API-4 login SUCCESS');
        
        // Set all EV localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('userRole', data.role || (userId.toLowerCase() === 'admin' ? 'admin' : 'user'));
        localStorage.setItem('userBalance', data.balance || '0');
        localStorage.setItem('loginTimestamp', Date.now().toString());
        
        onLoginSuccess();
        
        // Admin → Admin Panel, User → User Dashboard
        const targetRoute = data.role === 'admin' || userId.toLowerCase() === 'admin' ? '/admin' : '/user-dashboard';
        console.log('🚀 Redirecting to:', targetRoute);
        navigate(targetRoute);
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

  // Your original inline styles (enhanced for EV theme)
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0ea5e9 100%)',
    padding: '20px'
  };

  const formContainerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    width: '450px',
    maxWidth: '95%',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const headingStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: '28px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
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
    padding: '16px 20px',
    marginBottom: '24px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    boxSizing: 'border-box',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    backgroundColor: 'white'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    width: '100%',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
  };

  const handleMouseEnter = (e) => {
    e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        {/* EV Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '20px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 15px 35px rgba(16, 185, 129, 0.4)'
          }}>
            <Zap style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h2 style={headingStyle}>EV ChargeHub</h2>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
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
              borderColor: loading ? '#d1d5db' : '#10b981',
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
              borderColor: loading ? '#d1d5db' : '#10b981',
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

        {/* Demo Credentials */}
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '2px dashed #d1d5db',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>🧪 Test Credentials:</p>
          <div style={{ lineHeight: '1.6' }}>
            <div><code style={{ background: '#10b98120', padding: '4px 8px', borderRadius: '6px' }}>admin</code> / admin123</div>
            <div><code style={{ background: '#3b82f620', padding: '4px 8px', borderRadius: '6px' }}>user1</code> / 1234</div>
            <div><code style={{ background: '#eab30820', padding: '4px 8px', borderRadius: '6px' }}>Office</code> / Office@100</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
