import React, { useState } from 'react';

const API_BASE = 'https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1';

const LoginPage = ({ onLoginSuccess = () => {} }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const SECRET_USER_ID = 'Office';
  const SECRET_PASSWORD = 'Office@100';
  const ADMIN_ID = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = async () => {
    console.log('=== LOGIN ATTEMPT STARTED ===');
    console.log('User ID entered:', userId);

    setError('');
    setLoading(true);

    try {
      if (userId === ADMIN_ID && password === ADMIN_PASSWORD) {
        console.log('✅ ADMIN CREDENTIALS MATCHED');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('currentUserId', ADMIN_ID);
        console.log('📝 localStorage updated for admin');
        setLoading(false);
        setTimeout(() => {
          console.log('🚀 CALLING onLoginSuccess for ADMIN');
          onLoginSuccess('admin', { userId: ADMIN_ID, role: 'admin' });
        }, 100);
        return;
      }

      if (userId === SECRET_USER_ID && password === SECRET_PASSWORD) {
        console.log('✅ OFFICE CREDENTIALS MATCHED');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('currentUserId', SECRET_USER_ID);
        console.log('📝 localStorage updated for office user');
        setLoading(false);
        setTimeout(() => {
          console.log('🚀 CALLING onLoginSuccess for OFFICE USER');
          onLoginSuccess('user', { userId: SECRET_USER_ID, role: 'user' });
        }, 100);
        return;
      }

      console.log('📡 Trying API login...');
      const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          userId: userId,
          password: password
        })
      });

      console.log('📡 API Response Status:', response.status);
      const data = await response.json();
      console.log('📡 API Response Data:', data);

      if (response.ok && (data.success || data.userId || data.message === 'Login successful')) {
        console.log('✅ API LOGIN SUCCESSFUL');
        const role = data.role || (userId.toLowerCase() === 'admin' ? 'admin' : 'user');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('userBalance', data.balance || '0');
        console.log('📝 localStorage updated from API');
        const userData = {
          userId: userId,
          role: role,
          balance: data.balance
        };
        setLoading(false);
        setTimeout(() => {
          console.log('🚀 CALLING onLoginSuccess for API USER');
          onLoginSuccess(role, userData);
        }, 100);
      } else {
        console.log('❌ API LOGIN FAILED');
        const errorMsg = data.message || `Login failed with status ${response.status}`;
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error('💥 LOGIN ERROR:', err);
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 50%, #ffffff 100%)',
        padding: '15px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '600px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)',
          flexDirection: 'row'
        }}
      >
        {/* LEFT SIDE - WHITE SECTION (COMPANY INFO) */}
        <div
          style={{
            flex: '0.4',
            background: '#ffffff',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* DECORATIVE ELEMENT */}
          <div
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              width: '50px',
              height: '50px',
              border: '2px solid #f0f0f0',
              borderRadius: '10px',
              transform: 'rotate(45deg)'
            }}
          />

          {/* CONTENT WRAPPER */}
          <div
            style={{
              width: '100%',
              maxWidth: '280px',
              textAlign: 'center'
            }}
          >
            {/* COMPANY LOGO */}
            <div style={{ marginBottom: '25px' }}>
              <img
                src="/logo_160126.jpeg"
                alt="AlphaTech Solutions"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '70px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}
              />
            </div>

            {/* COMPANY TITLE */}
            <h1
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 8px 0',
                lineHeight: '1.2'
              }}
            >
              EV Charging Station
            </h1>

            {/* ACCENT LINE - RED */}
            <div
              style={{
                width: '50px',
                height: '3px',
                background: 'linear-gradient(90deg, #dc143c 0%, #a00000 100%)',
                margin: '0 auto 14px',
                borderRadius: '2px'
              }}
            />

            {/* SUBTITLE */}
            <p
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#333333',
                margin: '0 0 8px 0'
              }}
            >
              Smart Charging Control
            </p>

            {/* DESCRIPTION */}
            <p
              style={{
                fontSize: '11px',
                color: '#666666',
                lineHeight: '1.5',
                margin: '0 0 20px 0'
              }}
            >
              Enterprise solution for efficient EV charging management and real-time monitoring
            </p>

            {/* FEATURES LIST */}
            <div style={{ textAlign: 'left', display: 'inline-block' }}>
              {[
                { icon: '⚡', text: 'Fast Charging Technology' },
                { icon: '🔒', text: 'Secure Authentication' },
                { icon: '📊', text: 'Real-time Monitoring' },
                { icon: '🌍', text: 'Network Coverage' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}
                >
                  {/* FEATURE ICON CIRCLE - RED */}
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #dc143c 0%, #a00000 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(220, 20, 60, 0.3)'
                    }}
                  >
                    {item.icon}
                  </div>
                  {/* FEATURE TEXT */}
                  <span style={{ fontSize: '11px', color: '#444444' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - RED SECTION (LOGIN FORM) */}
        <div
          style={{
            flex: '1.6',
            background: 'linear-gradient(135deg, #dc143c 0%, #b01030 50%, #8b0000 100%)',
            padding: '50px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* DECORATIVE PATTERN OVERLAY */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(30deg, rgba(0,0,0,0.05) 12%, transparent 12.5%, transparent 87%, rgba(0,0,0,0.05) 87.5%, rgba(0,0,0,0.05)),
                linear-gradient(150deg, rgba(0,0,0,0.05) 12%, transparent 12.5%, transparent 87%, rgba(0,0,0,0.05) 87.5%, rgba(0,0,0,0.05))
              `,
              backgroundSize: '80px 140px',
              backgroundPosition: '0 0, 40px 70px',
              opacity: 0.3,
              pointerEvents: 'none'
            }}
          />

          {/* FORM CONTAINER */}
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* LOGIN HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '26px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 8px 0',
                  lineHeight: '1.3'
                }}
              >
                Welcome Back
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: '0',
                  lineHeight: '1.4'
                }}
              >
                Sign in to access your dashboard
              </p>
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            {error && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  animation: 'slideDown 0.3s ease'
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#ffffff',
                    lineHeight: '1.4'
                  }}
                >
                  {error}
                </span>
              </div>
            )}

            {/* USER ID INPUT FIELD */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '0.4px',
                  lineHeight: '1.3'
                }}
              >
                USER ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Enter your user ID"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '13px 15px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid transparent',
                  borderRadius: '8px',
                  color: '#1a1a1a',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.background = '#ffffff';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.borderColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* PASSWORD INPUT FIELD */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '0.4px',
                  lineHeight: '1.3'
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '13px 15px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid transparent',
                  borderRadius: '8px',
                  color: '#1a1a1a',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.background = '#ffffff';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.borderColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* SIGN IN BUTTON */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#ffffff',
                background: '#dc143c',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '0.8px',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                  e.target.style.background = '#b01030';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                e.target.style.background = '#dc143c';
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite'
                    }}
                  />
                  SIGNING IN...
                </span>
              ) : (
                'SIGN IN'
              )}
            </button>

            {/* FOOTER TEXT */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.5',
                  margin: '0'
                }}
              >
                Secured by enterprise-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATIONS & GLOBAL STYLES */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input::placeholder {
          color: rgba(0, 0, 0, 0.35);
        }

        input:disabled {
          cursor: not-allowed;
        }

        button:disabled {
          cursor: not-allowed;
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* DESKTOP */
        @media (min-width: 1025px) {
          div[style*="flexDirection: 'row'"] {
            flex-direction: row !important;
          }
        }

        /* LARGE DESKTOP (2560px+) */
        @media (min-width: 2560px) {
          div[style*="maxWidth: '1100px'"] {
            maxWidth: 1400px !important;
          }

          h1 {
            font-size: 32px !important;
          }

          h2 {
            font-size: 36px !important;
          }

          p {
            font-size: 16px !important;
          }

          input {
            font-size: 18px !important;
            padding: 16px 18px !important;
          }

          button {
            font-size: 16px !important;
            padding: 16px !important;
          }

          div[style*="maxWidth: '280px'"] {
            max-width: 350px !important;
          }

          div[style*="maxWidth: '320px'"] {
            max-width: 400px !important;
          }
        }

        /* DESKTOP (1440px - 2559px) */
        @media (min-width: 1441px) {
          h1 {
            font-size: 26px !important;
          }

          h2 {
            font-size: 30px !important;
          }

          p {
            font-size: 14px !important;
          }

          input {
            font-size: 16px !important;
            padding: 14px 16px !important;
          }

          button {
            font-size: 15px !important;
            padding: 14px !important;
          }
        }

        /* STANDARD DESKTOP (1025px - 1440px) */
        @media (min-width: 1025px) {
          h1 {
            font-size: 22px !important;
          }

          h2 {
            font-size: 26px !important;
          }

          p {
            font-size: 12px !important;
          }

          div[style*="maxHeight: '70px'"] {
            maxHeight: 80px !important;
          }
        }

        /* TABLET */
        @media (max-width: 1024px) {
          div[style*="padding: '50px 40px'"] {
            padding: 35px 25px !important;
          }

          div[style*="padding: '50px 40px'"] {
            padding: 35px 25px !important;
          }

          h1 {
            font-size: 20px !important;
          }

          h2 {
            font-size: 20px !important;
          }

          p {
            font-size: 10px !important;
          }

          input {
            font-size: 13px !important;
            padding: 11px 12px !important;
          }

          button {
            font-size: 12px !important;
            padding: 11px !important;
          }

          div[style*="maxWidth: '320px'"] {
            max-width: 85% !important;
          }

          div[style*="maxWidth: '280px'"] {
            max-width: 100% !important;
          }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          div[style*="flexDirection: 'row'"] {
            flex-direction: column !important;
            minHeight: auto !important;
          }

          div[style*="flex: '0.4'"] {
            flex: none !important;
            width: 100% !important;
            padding: 28px 16px !important;
          }

          div[style*="flex: '1.6'"] {
            flex: none !important;
            width: 100% !important;
            padding: 28px 16px !important;
          }

          h1 {
            font-size: 20px !important;
            margin-bottom: 8px !important;
          }

          h2 {
            font-size: 20px !important;
          }

          p {
            font-size: 11px !important;
          }

          div[style*="maxWidth: '320px'"] {
            max-width: 100% !important;
          }

          div[style*="maxWidth: '280px'"] {
            max-width: 100% !important;
          }

          div[style*="marginBottom: '25px'"] {
            margin-bottom: 18px !important;
          }

          input {
            font-size: 14px !important;
            padding: 11px 12px !important;
          }

          button {
            font-size: 12px !important;
            padding: 11px !important;
          }

          label {
            font-size: 11px !important;
          }

          div[style*="width: '50px'"] {
            width: 35px !important;
            height: 35px !important;
          }

          div[style*="maxHeight: '70px'"] {
            maxHeight: 55px !important;
          }
        }

        /* SMALL MOBILE */
        @media (max-width: 480px) {
          div[style*="padding: '15px'"] {
            padding: 10px !important;
          }

          div[style*="padding: '28px 16px'"] {
            padding: 20px 14px !important;
          }

          h1 {
            font-size: 18px !important;
          }

          h2 {
            font-size: 18px !important;
          }

          p {
            font-size: 9px !important;
          }

          input {
            padding: 10px 10px !important;
            font-size: 13px !important;
          }

          button {
            padding: 10px !important;
            font-size: 11px !important;
          }

          div[style*="marginBottom: '32px'"] {
            margin-bottom: 18px !important;
          }

          div[style*="marginBottom: '24px'"] {
            margin-bottom: 14px !important;
          }

          label {
            font-size: 10px !important;
          }

          div[style*="maxHeight: '70px'"] {
            maxHeight: 50px !important;
          }
        }

        /* EXTRA SMALL MOBILE */
        @media (max-width: 360px) {
          div[style*="padding: '20px 14px'"] {
            padding: 16px 12px !important;
          }

          h2 {
            font-size: 16px !important;
          }

          p {
            font-size: 8px !important;
          }

          input {
            font-size: 12px !important;
            padding: 9px 10px !important;
          }

          button {
            font-size: 10px !important;
          }

          div[style*="maxWidth: '320px'"] {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;