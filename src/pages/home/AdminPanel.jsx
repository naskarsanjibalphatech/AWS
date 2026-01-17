import React, { useState, useEffect } from 'react';
import { User, DollarSign, Trash2, LogOut, Zap, AlertCircle, Plus, CheckCircle } from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [action, setAction] = useState('list');
  const [adminId] = useState('admin');
  const [adminPassword] = useState('admin123');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [newBalance, setNewBalance] = useState('');

  const USER_API = "https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1";

  const safeParseResponse = async (response) => {
    try {
      const contentType = response.headers.get('content-type');
      const rawText = await response.text();
      if (contentType && contentType.includes('application/json')) {
        return JSON.parse(rawText);
      }
      return { message: rawText || 'Server error', success: response.ok };
    } catch (err) {
      return { message: 'Failed to parse response', success: false };
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📡 Fetching users with API:', USER_API);
      console.log('Payload:', { action: "listUsers", adminId, adminPassword });
      
      const response = await fetch(USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "listUsers", adminId, adminPassword })
      });
      
      console.log('Response Status:', response.status);
      const data = await safeParseResponse(response);
      console.log('Response Data:', data);
      
      if (response.ok && data.users) {
        setUsers(data.users);
        setSuccess(`Loaded ${data.users.length} users`);
      } else if (data.users) {
        setUsers(data.users);
        setSuccess(`Loaded ${data.users.length} users`);
      } else {
        setError(data.message || `Failed to load users (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeAdminAction = async (payload) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('🚀 Executing action:', payload);
      
      const response = await fetch(USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      console.log('Response Status:', response.status);
      const data = await safeParseResponse(response);
      console.log('Response Data:', data);
      console.log('Response OK:', response.ok);
      
      if ((response.ok || response.status === 200) && data.message) {
        setSuccess(data.message);
        console.log('✅ Action successful');
        setTimeout(() => fetchUsers(), 500);
        resetForm();
      } else if (data.message && (response.status === 200 || response.status === 201 || response.status === 400)) {
        if (data.message.toLowerCase().includes('success') || data.message.toLowerCase().includes('updated') || data.message.toLowerCase().includes('created') || data.message.toLowerCase().includes('deleted')) {
          setSuccess(data.message);
          console.log('✅ Action successful');
          setTimeout(() => fetchUsers(), 500);
          resetForm();
        } else {
          setError(data.message || `HTTP ${response.status}`);
          console.log('❌ Error:', data.message);
        }
      } else {
        setError(data.message || `HTTP ${response.status}`);
        console.log('❌ Error:', data.message);
      }
    } catch (err) {
      console.error('Action error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    if (!userId || !password) return setError('User ID and Password required');
    executeAdminAction({ action: "create", adminId, adminPassword, userId, password });
  };

  const handleUpdateBalance = () => {
    if (!userId || newBalance === '') return setError('User ID and Amount required');
    executeAdminAction({ action: "updateBalance", adminId, adminPassword, userId, newBalance: parseFloat(newBalance) });
  };

  const handleDeleteUser = () => {
    if (!userId) return setError('User ID required');
    executeAdminAction({ action: "deleteUser", adminId, adminPassword, userId });
  };

  const resetForm = () => {
    setUserId('');
    setPassword('');
    setNewBalance('');
    setAction('list');
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    window.location.href = '/login';
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif'
  };

  const headerStyle = {
    background: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  };

  const headerContentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: window.innerWidth < 768 ? '12px 16px' : '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  };

  const logoBoxStyle = {
    width: window.innerWidth < 768 ? '40px' : '50px',
    height: window.innerWidth < 768 ? '40px' : '50px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    flexShrink: 0
  };

  const titleStyle = {
    fontSize: window.innerWidth < 640 ? '16px' : window.innerWidth < 768 ? '18px' : '28px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 4px 0'
  };

  const subtitleStyle = {
    fontSize: '12px',
    color: '#718096',
    margin: '0',
    fontWeight: '500',
    display: window.innerWidth < 768 ? 'none' : 'block'
  };

  const mainStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: window.innerWidth < 640 ? '16px' : window.innerWidth < 768 ? '20px' : '20px',
    minHeight: 'calc(100vh - 80px)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
    gap: window.innerWidth < 768 ? '16px' : '20px'
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: window.innerWidth < 640 ? '14px' : window.innerWidth < 768 ? '16px' : '28px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: window.innerWidth < 768 ? '16px' : '20px'
  };

  const cardTitleStyle = {
    fontSize: window.innerWidth < 640 ? '14px' : window.innerWidth < 768 ? '16px' : '20px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0'
  };

  const inputStyle = {
    width: '100%',
    padding: window.innerWidth < 768 ? '10px' : '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: window.innerWidth < 768 ? '13px' : '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const buttonPrimaryStyle = {
    width: '100%',
    padding: window.innerWidth < 768 ? '10px' : '12px',
    background: '#667eea',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: window.innerWidth < 768 ? '13px' : '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const errorMessageStyle = {
    marginBottom: window.innerWidth < 768 ? '16px' : '20px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: window.innerWidth < 768 ? '12px' : '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  };

  const successMessageStyle = {
    marginBottom: window.innerWidth < 768 ? '16px' : '20px',
    background: '#dcfce7',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: window.innerWidth < 768 ? '12px' : '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  };

  const userListItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: window.innerWidth < 768 ? '10px' : '14px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    fontSize: window.innerWidth < 768 ? '13px' : '15px'
  };

  const actionButtonsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth < 640 ? '1fr' : window.innerWidth < 768 ? '1fr 1fr' : '1fr 1fr',
    gap: window.innerWidth < 768 ? '8px' : '8px',
    marginBottom: window.innerWidth < 768 ? '16px' : '20px'
  };

  const actionButtonStyle = {
    padding: window.innerWidth < 768 ? '8px' : '10px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: window.innerWidth < 640 ? '10px' : window.innerWidth < 768 ? '11px' : '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const formContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={logoBoxStyle}>
              <DollarSign style={{ width: '28px', height: '28px', color: '#ffffff' }} />
            </div>
            <div>
              <h1 style={titleStyle}>Admin Dashboard</h1>
              <p style={subtitleStyle}>User Management System</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: window.innerWidth < 768 ? '6px' : '8px', alignItems: 'center' }}>
            <button 
              onClick={fetchUsers} 
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: window.innerWidth < 768 ? '4px' : '8px',
                padding: window.innerWidth < 640 ? '6px 10px' : window.innerWidth < 768 ? '8px 12px' : '10px 20px',
                background: loading ? '#cbd5e1' : '#667eea',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth < 640 ? '10px' : window.innerWidth < 768 ? '11px' : '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <Zap style={{ width: window.innerWidth < 768 ? '14px' : '18px', height: window.innerWidth < 768 ? '14px' : '18px' }} />
              <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Refresh</span>
            </button>

            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: window.innerWidth < 768 ? '4px' : '8px',
                padding: window.innerWidth < 640 ? '6px 10px' : window.innerWidth < 768 ? '8px 12px' : '10px 20px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: window.innerWidth < 640 ? '10px' : window.innerWidth < 768 ? '11px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <LogOut style={{ width: window.innerWidth < 768 ? '14px' : '18px', height: window.innerWidth < 768 ? '14px' : '18px' }} />
              <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={mainStyle}>
        {/* Error Message */}
        {error && (
          <div style={errorMessageStyle}>
            <AlertCircle style={{ width: '24px', height: '24px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#991b1b', margin: '0 0 4px 0' }}>Error</h3>
              <p style={{ fontSize: '14px', color: '#7f1d1d', margin: '0' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={successMessageStyle}>
            <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#166534', margin: '0 0 4px 0' }}>Success</h3>
              <p style={{ fontSize: '14px', color: '#15803d', margin: '0' }}>{success}</p>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div style={gridStyle}>
          {/* Users List Card */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
              </div>
              <h2 style={cardTitleStyle}>All Users ({users.length})</h2>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <User style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', margin: '0' }}>No users found</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {users.map((user, index) => (
                  <div key={index} style={userListItemStyle}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a202c' }}>
                        {user.userId}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        Balance: ₹{parseFloat(user.balance || 0).toFixed(2)}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      background: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Actions Card */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Plus style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              </div>
              <h2 style={cardTitleStyle}>Admin Actions</h2>
            </div>

            {/* Action Buttons Grid */}
            <div style={actionButtonsContainerStyle}>
              <button onClick={() => setAction('list')} style={{ ...actionButtonStyle, background: action === 'list' ? '#667eea' : '#f3f4f6', color: action === 'list' ? '#fff' : '#374151' }}>List Users</button>
              <button onClick={() => setAction('create')} style={{ ...actionButtonStyle, background: action === 'create' ? '#10b981' : '#f3f4f6', color: action === 'create' ? '#fff' : '#374151' }}>Create User</button>
              <button onClick={() => setAction('updateBalance')} style={{ ...actionButtonStyle, background: action === 'updateBalance' ? '#f59e0b' : '#f3f4f6', color: action === 'updateBalance' ? '#fff' : '#374151' }}>Add Balance</button>
              <button onClick={() => setAction('deleteUser')} style={{ ...actionButtonStyle, background: action === 'deleteUser' ? '#ef4444' : '#f3f4f6', color: action === 'deleteUser' ? '#fff' : '#374151' }}>Delete User</button>
            </div>

            {/* Dynamic Forms */}
            {action === 'create' && (
              <div style={formContainerStyle}>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" style={inputStyle} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={inputStyle} />
                <button onClick={handleCreateUser} disabled={loading || !userId || !password} style={{ ...buttonPrimaryStyle, background: '#10b981', opacity: loading || !userId || !password ? 0.6 : 1 }}>✅ Create User</button>
              </div>
            )}

            {action === 'updateBalance' && (
              <div style={formContainerStyle}>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" style={inputStyle} />
                <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} placeholder="Amount" style={inputStyle} />
                <button onClick={handleUpdateBalance} disabled={loading || !userId || newBalance === ''} style={{ ...buttonPrimaryStyle, background: '#f59e0b', opacity: loading || !userId || newBalance === '' ? 0.6 : 1 }}>💰 Add Balance</button>
              </div>
            )}

            {action === 'deleteUser' && (
              <div style={formContainerStyle}>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" style={inputStyle} />
                <button onClick={handleDeleteUser} disabled={loading || !userId} style={{ ...buttonPrimaryStyle, background: '#ef4444', opacity: loading || !userId ? 0.6 : 1 }}>🗑️ Delete User</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;