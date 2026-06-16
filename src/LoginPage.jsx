import React, { useState } from 'react';
import { Gauge, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const API_BASE = 'https://6hmya3a8uj.execute-api.ap-south-1.amazonaws.com/DEFAULT';

const palette = {
  bg: '#0a0f1c',
  bgGrid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)',
  surface: '#111a2e',
  inset: '#0d1424',
  border: '#22304a',
  borderSoft: '#1a2640',
  text: '#e7edf7',
  textMuted: '#7e8db0',
  textFaint: '#4d5c7e',
  cyan: '#2dd4ee',
  cyanDim: 'rgba(45,212,238,0.15)',
  red: '#fb6f6f',
  redDim: 'rgba(251,111,111,0.15)',
};

const LoginPage = ({ onLoginSuccess = () => {} }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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

      const responseData = await response.json();

      const data =
        typeof responseData.body === 'string'
          ? JSON.parse(responseData.body)
          : responseData;

      if (response.ok && data.role) {
        const role = data.role;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('currentUserId', userId);

        const userData = {
          userId: userId,
          role: role,
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

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '14px 14px 14px 42px',
    fontSize: '14px',
    background: palette.inset,
    border: `1px solid ${focusedField === fieldName ? palette.cyan + '80' : palette.border}`,
    borderRadius: '10px',
    color: palette.text,
    boxSizing: 'border-box',
    outline: 'none',
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    boxShadow: focusedField === fieldName ? `0 0 0 3px ${palette.cyanDim}` : 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: `${palette.bgGrid}, linear-gradient(180deg, ${palette.bg} 0%, #0c1322 100%)`,
      backgroundSize: '22px 22px, 100% 100%',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: palette.text,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: palette.surface,
        border: `1px solid ${palette.borderSoft}`,
        borderRadius: '18px',
        padding: '40px 32px',
        boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1f3a63 0%, #0f1c33 100%)',
            border: `1px solid ${palette.cyan}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Gauge style={{ width: '26px', height: '26px', color: palette.cyan }} />
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: palette.text,
            margin: '0 0 6px 0',
            textAlign: 'center',
          }}>
            BOUNSI Gate Control
          </h1>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: palette.cyan,
            margin: 0,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            Cloud SCADA
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: palette.redDim,
            border: `1px solid ${palette.red}40`,
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: palette.red, flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '13px', color: palette.text, lineHeight: 1.5, opacity: 0.9 }}>
              {error}
            </span>
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* User ID */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: palette.textMuted,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}>
              User ID
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: palette.textFaint, width: '16px', height: '16px', pointerEvents: 'none',
              }} />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setFocusedField('userId')}
                onBlur={() => setFocusedField(null)}
                disabled={loading}
                placeholder="Enter your user ID"
                style={inputStyle('userId')}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: palette.textMuted,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: palette.textFaint, width: '16px', height: '16px', pointerEvents: 'none',
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={loading}
                placeholder="Enter your password"
                style={inputStyle('password')}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#06121f',
              background: palette.cyan,
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '6px',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: `0 8px 24px ${palette.cyanDim}`,
              transition: 'opacity 0.15s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <ArrowRight style={{ width: '15px', height: '15px' }} />}
          </button>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '11px',
          color: palette.textFaint,
          textAlign: 'center',
          marginTop: '26px',
          marginBottom: 0,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.08em',
        }}>
          SECURED · ENCRYPTED CONNECTION
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        input::placeholder { color: ${palette.textFaint}; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

export default LoginPage;