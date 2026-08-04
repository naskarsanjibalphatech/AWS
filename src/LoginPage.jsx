import React, { useState } from 'react';

const API_BASE = 'https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1';

const LoginPage = ({ onLoginSuccess = () => {} }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 

  const handleLogin = async () => {
    setError('');
    setLoading(true);

   try {

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

      const data = await response.json();

      if (response.ok) {
        const role = data.role;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('currentUserId', userId);
        
        
        const userData = {
  userId: userId,
  role: role
};

        setLoading(false);
        setTimeout(() => {
          onLoginSuccess(role, userData);
        }, 100);
      } else {
        const errorMsg = data.message || 'Login failed. Please check your credentials.';
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '20px',
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif'
    }}>
      {/* DESKTOP VERSION */}
      <div className="desktop-view" style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1300px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#ffffff',
        minHeight: '750px'
      }}>
        {/* DESKTOP LEFT - WHITE */}
        <div style={{
          flex: '1',
          background: '#ffffff',
          padding: '70px 55px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          position: 'relative',
          paddingTop: '40px'
        }}>
          <div style={{ textAlign: 'left', width: '100%', maxWidth: '380px' }}>
            {/* LOGO AT TOP - CENTER ALIGNED */}
            <div style={{ marginBottom: '45px', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <img src="/logo_160126.jpeg" alt="AlphaTech Solutions" style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '85px',
                objectFit: 'contain'
              }} />
            </div>

            {/* TITLE */}
            <h1 style={{
              fontSize: '34px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 14px 0',
              lineHeight: '1.2'
            }}>
              BOUNSI Gate Control System
            </h1>

            {/* RED LINE */}
            <div style={{
              width: '60px',
              height: '3px',
              background: '#dc143c',
              margin: '0 0 22px 0'
            }} />

            {/* SUBTITLE */}
            <p style={{
              fontSize: '16px',
              color: '#666666',
              lineHeight: '1.8',
              margin: '0 0 50px 0',
              fontWeight: '500'
            }}>
              Industrial Gate Monitoring & Control System
            </p>

            {/* FEATURES ON DESKTOP LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
              {[
                { icon: '⚡', title: 'Ultra-Fast Charging', desc: 'High-speed technology for quick charge' },
                { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-level encryption & protection' },
                { icon: '📊', title: 'Real-time Analytics', desc: 'Live monitoring and reports' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    fontSize: '32px',
                    minWidth: '32px'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '5px'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#888888',
                      lineHeight: '1.5'
                    }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DESKTOP RIGHT - RED LOGIN */}
        <div style={{
          flex: '1',
          background: 'linear-gradient(135deg, #dc143c 0%, #c41233 100%)',
          padding: '70px 55px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            {/* WELCOME TITLE */}
            <h2 style={{
              fontSize: '34px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 10px 0'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0 0 40px 0',
              fontWeight: '500'
            }}>
              Sign in to your account
            </p>

            {/* ERROR MESSAGE */}
            {error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '28px',
                display: 'flex',
                gap: '12px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span style={{
                  fontSize: '13px',
                  color: '#ffffff',
                  lineHeight: '1.5'
                }}>
                  {error}
                </span>
              </div>
            )}

            {/* FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* USER ID */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Enter your user ID"
                  style={{
                    width: '100%',
                    padding: '13px 15px',
                    fontSize: '14px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#1a1a1a',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '13px 15px',
                    fontSize: '14px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#1a1a1a',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
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
                  padding: '13px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#dc143c',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '0.5px',
                  marginTop: '10px',
                  textTransform: 'uppercase',
                  opacity: loading ? 0.8 : 1,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </div>

            {/* FEATURES BELOW BUTTON */}
            <div style={{ marginTop: '38px', paddingTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  { icon: '⚡', title: 'Fast Charging', desc: 'High-speed technology' },
                  { icon: '🔒', title: 'Secure', desc: 'Enterprise security' },
                  { icon: '📊', title: 'Real-time', desc: 'Live monitoring' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      minWidth: '20px'
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#ffffff',
                        marginBottom: '3px'
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.75)'
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <p style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              marginTop: '32px',
              margin: '32px 0 0 0'
            }}>
              🔐 Secured by enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="mobile-view" style={{
        display: 'none',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        borderRadius: '0',
        overflow: 'hidden',
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}>
        {/* MOBILE TOP - WHITE */}
        <div style={{
          background: '#ffffff',
          padding: '30px 24px 45px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            {/* LOGO - CENTER ALIGNED */}
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <img src="/logo_160126.jpeg" alt="AlphaTech Solutions" style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '60px',
                objectFit: 'contain'
              }} />
            </div>

            {/* TITLE */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 12px 0'
            }}>
              EV CHARGING STATION
            </h1>

            {/* RED LINE */}
            <div style={{
              width: '35px',
              height: '2px',
              background: '#dc143c',
              margin: '0 auto 16px auto'
            }} />

            {/* SUBTITLE */}
            <p style={{
              fontSize: '13px',
              color: '#666666',
              lineHeight: '1.6',
              margin: '0',
              fontWeight: '500'
            }}>
              Smart Charging Management System
            </p>
          </div>
        </div>

        {/* MOBILE BOTTOM - RED LOGIN */}
        <div style={{
          background: 'linear-gradient(135deg, #dc143c 0%, #c41233 100%)',
          padding: '45px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}>
          <div style={{ width: '100%' }}>
            {/* WELCOME TITLE */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 6px 0'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0 0 28px 0',
              fontWeight: '500'
            }}>
              Sign in to your account
            </p>

            {/* ERROR MESSAGE */}
            {error && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px'
              }}>
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <span style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  lineHeight: '1.4'
                }}>
                  {error}
                </span>
              </div>
            )}

            {/* FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* USER ID */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Enter your user ID"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    fontSize: '14px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#1a1a1a',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    fontSize: '14px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#1a1a1a',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
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
                  padding: '11px 13px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#dc143c',
                  background: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  letterSpacing: '0.4px',
                  marginTop: '6px',
                  textTransform: 'uppercase',
                  opacity: loading ? 0.8 : 1,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </div>

            {/* FEATURES BELOW BUTTON */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { icon: '⚡', title: 'Fast Charging' },
                  { icon: '🔒', title: 'Secure' },
                  { icon: '📊', title: 'Real-time' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      minWidth: '16px'
                    }}>
                      {item.icon}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <p style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              marginTop: '22px',
              margin: '22px 0 0 0'
            }}>
              🔐 Secured by enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder {
          color: rgba(0, 0, 0, 0.3);
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }

        @media (min-width: 769px) {
          .desktop-view {
            display: flex !important;
          }
          .mobile-view {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .desktop-view {
            display: none !important;
          }
          .mobile-view {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;