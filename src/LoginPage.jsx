import React, { useState } from 'react';

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE = 'https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1';

// ============================================
// MAIN LOGIN PAGE COMPONENT
// ============================================
const LoginPage = ({ onLoginSuccess = () => {} }) => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================
  // HARDCODED CREDENTIALS
  // ============================================
  const SECRET_USER_ID = 'Office';
  const SECRET_PASSWORD = 'Office@100';
  const ADMIN_ID = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  // ============================================
  // MAIN LOGIN HANDLER
  // ============================================
  const handleLogin = async () => {
    console.log('=== LOGIN ATTEMPT STARTED ===');
    console.log('User ID entered:', userId);

    // Clear previous errors
    setError('');
    // Start loading
    setLoading(true);

    try {
      // ============================================
      // CONDITION 1: CHECK ADMIN CREDENTIALS
      // ============================================
      if (userId === ADMIN_ID && password === ADMIN_PASSWORD) {
        console.log('✅ ADMIN CREDENTIALS MATCHED');

        // Set localStorage values
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('currentUserId', ADMIN_ID);

        console.log('📝 localStorage updated for admin');

        // Stop loading indicator
        setLoading(false);

        // Call parent component callback
        setTimeout(() => {
          console.log('🚀 CALLING onLoginSuccess for ADMIN');
          onLoginSuccess('admin', { userId: ADMIN_ID, role: 'admin' });
        }, 100);

        return;
      }

      // ============================================
      // CONDITION 2: CHECK OFFICE CREDENTIALS
      // ============================================
      if (userId === SECRET_USER_ID && password === SECRET_PASSWORD) {
        console.log('✅ OFFICE CREDENTIALS MATCHED');

        // Set localStorage values
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('currentUserId', SECRET_USER_ID);

        console.log('📝 localStorage updated for office user');

        // Stop loading indicator
        setLoading(false);

        // Call parent component callback
        setTimeout(() => {
          console.log('🚀 CALLING onLoginSuccess for OFFICE USER');
          onLoginSuccess('user', { userId: SECRET_USER_ID, role: 'user' });
        }, 100);

        return;
      }

      // ============================================
      // CONDITION 3: TRY API LOGIN
      // ============================================
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

      // Check if login was successful
      if (response.ok && (data.success || data.userId || data.message === 'Login successful')) {
        console.log('✅ API LOGIN SUCCESSFUL');

        // Determine user role
        const role = data.role || (userId.toLowerCase() === 'admin' ? 'admin' : 'user');

        // Set localStorage values
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('userBalance', data.balance || '0');

        console.log('📝 localStorage updated from API');

        // Prepare user data
        const userData = {
          userId: userId,
          role: role,
          balance: data.balance
        };

        // Stop loading indicator
        setLoading(false);

        // Call parent component callback
        setTimeout(() => {
          console.log('🚀 CALLING onLoginSuccess for API USER');
          onLoginSuccess(role, userData);
        }, 100);
      } else {
        // API login failed
        console.log('❌ API LOGIN FAILED');
        const errorMsg = data.message || `Login failed with status ${response.status}`;
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      // Network or other errors
      console.error('💥 LOGIN ERROR:', err);
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  // ============================================
  // HANDLE ENTER KEY PRESS
  // ============================================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  // ============================================
  // RENDER UI
  // ============================================
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 50%, #ffffff 100%)',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {/* MAIN CARD CONTAINER */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '600px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* LEFT SIDE - WHITE SECTION (COMPANY INFO) */}
        <div
          style={{
            flex: '1',
            background: '#ffffff',
            padding: '60px 50px',
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
              top: '40px',
              right: '40px',
              width: '60px',
              height: '60px',
              border: '2px solid #f0f0f0',
              borderRadius: '12px',
              transform: 'rotate(45deg)'
            }}
          />

          {/* CONTENT WRAPPER */}
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              textAlign: 'center'
            }}
          >
            {/* COMPANY LOGO */}
            <div style={{ marginBottom: '50px' }}>
              <img
                src="/logo_160126.jpeg"
                alt="AlphaTech Solutions"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '120px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}
              />
            </div>

            {/* COMPANY TITLE */}
            <h1
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '16px',
                lineHeight: '1.2',
                margin: '0 0 16px 0'
              }}
            >
              EV Charging Station
            </h1>

            {/* ACCENT LINE - RED */}
            <div
              style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #dc143c 0%, #a00000 100%)',
                margin: '0 auto 24px',
                borderRadius: '2px'
              }}
            />

            {/* SUBTITLE */}
            <p
              style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#333333',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}
            >
              Smart Charging Control
            </p>

            {/* DESCRIPTION */}
            <p
              style={{
                fontSize: '15px',
                color: '#666666',
                lineHeight: '1.7',
                marginBottom: '40px',
                margin: '0 0 40px 0'
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
                    gap: '12px',
                    marginBottom: '14px'
                  }}
                >
                  {/* FEATURE ICON CIRCLE - RED */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #dc143c 0%, #a00000 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(220, 20, 60, 0.3)'
                    }}
                  >
                    {item.icon}
                  </div>
                  {/* FEATURE TEXT */}
                  <span style={{ fontSize: '15px', color: '#444444' }}>
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
            flex: '1',
            background: 'linear-gradient(135deg, #dc143c 0%, #b01030 50%, #8b0000 100%)',
            padding: '60px 50px',
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
              maxWidth: '400px',
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* LOGIN HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}
              >
                Welcome Back
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: '0'
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
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  animation: 'slideDown 0.3s ease'
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                <span
                  style={{
                    fontSize: '14px',
                    color: '#ffffff',
                    lineHeight: '1.4'
                  }}
                >
                  {error}
                </span>
              </div>
            )}

            {/* USER ID INPUT FIELD */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
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
                  padding: '16px 18px',
                  fontSize: '15px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid transparent',
                  borderRadius: '10px',
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
            <div style={{ marginBottom: '32px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
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
                  padding: '16px 18px',
                  fontSize: '15px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid transparent',
                  borderRadius: '10px',
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
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                color: '#ffffff',
                background: '#dc143c',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '1px',
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
                    gap: '12px'
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
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
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
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
          color: rgba(0, 0, 0, 0.4);
        }

        input:disabled {
          cursor: not-allowed;
        }

        button:disabled {
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          div[style*="flex: 1"] {
            padding: 40px 30px !important;
          }
        }

        @media (max-width: 600px) {
          div[style*="flex: 1"] {
            padding: 30px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;