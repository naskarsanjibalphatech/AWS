// src/pages/home/AdminPage.jsx - FULL VERSION WITH AUTO PLC 420051
import React, { useState, useEffect } from 'react';

const API_URL = 'https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1';
const PLC_WRITE_API = 'https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Edit states
  const [selectedUserForPassword, setSelectedUserForPassword] = useState('');
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [selectedUserForIdChange, setSelectedUserForIdChange] = useState('');
  const [newUserIdForUser, setNewUserIdForUser] = useState('');

  // ✅ LOCALSTORAGE FUNCTIONS
  const saveUsers = (userList) => {
    setUsers(userList);
    localStorage.setItem('ev_users', JSON.stringify(userList));
  };

  // ✅ LOAD FROM LOCALSTORAGE
  useEffect(() => {
    const savedUsers = localStorage.getItem('ev_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  // API CALL FUNCTION
  const callApi = async (bodyObj) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error('API error:', err);
      setApiError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 1. CREATE USER
  const createUser = async () => {
    if (!newUserId || !newPassword) {
      alert('❌ Fill User ID and Password');
      return;
    }
    if (users.find(u => u.id === newUserId)) {
      alert('❌ User ID already exists');
      return;
    }

    const payload = {
      action: 'create',
      adminId: 'admin',
      adminPassword: 'admin123',
      userId: newUserId,
      password: newPassword,
    };

    const result = await callApi(payload);
    if (!result) return;

    const newUser = { id: newUserId, password: newPassword, balance: 0, role: 'user' };
    saveUsers([...users, newUser]);
    setNewUserId(''); 
    setNewPassword('');
    alert('✅ User created successfully!');
  };

  // 2. DELETE USER
  const deleteUser = async (userId) => {
    if (!window.confirm(`Delete user ${userId}?`)) return;

    const payload = {
      action: 'deleteUser',
      adminId: 'admin',
      adminPassword: 'admin123',
      userId,
    };

    const result = await callApi(payload);
    if (!result) return;

    saveUsers(users.filter(u => u.id !== userId));
    alert('✅ User deleted successfully!');
  };

  // 3. UPDATE BALANCE + AUTO PLC 420051 ✅
  const updateBalance = async () => {
    if (!selectedUser || !newBalance) {
      alert('❌ Select user and enter balance');
      return;
    }

    const balanceNum = parseFloat(newBalance);
    if (isNaN(balanceNum)) {
      alert('❌ Balance must be a number');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // STEP 1: Update DynamoDB
      const payload = {
        action: 'updateBalance',
        userId: selectedUser,
        newBalance: balanceNum,
      };

      const result = await callApi(payload);
      if (!result) return;

      // STEP 2: Update localStorage UI
      saveUsers(users.map(u => u.id === selectedUser ? { ...u, balance: balanceNum } : u));

      // STEP 3: AUTO SEND USER TO PLC 420051 ✅
      console.log(`🚀 AUTO: "${selectedUser}" → PLC 420051`);
      const plcRes = await fetch(`${PLC_WRITE_API}/?address=420051&value=${selectedUser}`, { 
        method: 'POST' 
      });

      setNewBalance('');
      alert(`✅ Balance: ${balanceNum} kWh | PLC 420051: "${selectedUser}"`);
      
    } catch (err) {
      console.error('Update failed:', err);
      setApiError(err.message);
      alert('❌ Update failed');
    } finally {
      setLoading(false);
    }
  };

  // 4. SET USER ID TO PLC 420051 (Manual)
  const setUserIdToPLC = async () => {
    if (!selectedUser) {
      alert('❌ Select user first');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${PLC_WRITE_API}/?address=420051&value=${selectedUser}`, {
        method: 'POST'
      });
      
      if (res.ok) {
        alert(`✅ User "${selectedUser}" sent to PLC 420051`);
      } else {
        alert('❌ PLC write failed');
      }
    } catch (err) {
      alert('❌ Network error');
    } finally {
      setLoading(false);
    }
  };

  // 5. CHANGE PASSWORD
  const editUserPassword = async () => {
    if (!selectedUserForPassword || !newPasswordForUser) {
      alert('❌ Select user and enter new password');
      return;
    }

    const payload = {
      action: 'changeUserPassword',
      adminId: 'admin',
      adminPassword: 'admin123',
      userId: selectedUserForPassword,
      newPassword: newPasswordForUser,
    };

    const result = await callApi(payload);
    if (!result) return;

    saveUsers(users.map(u => 
      u.id === selectedUserForPassword ? { ...u, password: newPasswordForUser } : u
    ));
    setSelectedUserForPassword(''); 
    setNewPasswordForUser('');
    alert('✅ Password updated!');
  };

  // 6. EDIT USER ID
  const editUserId = async () => {
    if (!selectedUserForIdChange || !newUserIdForUser) {
      alert('❌ Select user and enter new User ID');
      return;
    }
    if (users.find(u => u.id === newUserIdForUser)) {
      alert('❌ New User ID already exists');
      return;
    }

    const payload = {
      action: 'editUserId',
      adminId: 'admin',
      adminPassword: 'admin123',
      oldUserId: selectedUserForIdChange,
      newUserId: newUserIdForUser,
    };

    const result = await callApi(payload);
    if (!result) return;

    saveUsers(users.map(u => 
      u.id === selectedUserForIdChange ? { ...u, id: newUserIdForUser } : u
    ));
    setSelectedUserForIdChange(''); 
    setNewUserIdForUser('');
    alert('✅ User ID updated!');
  };

  const handleLogout = () => {
    if (window.confirm('Logout from Admin?')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // STYLES
  const inputStyle = {
    padding: '15px', border: '2px solid #ddd', borderRadius: '10px',
    width: '300px', fontSize: '16px', fontWeight: '500'
  };

  const selectStyle = {
    padding: '15px', border: '2px solid #ddd', borderRadius: '10px',
    width: '300px', fontSize: '16px', fontWeight: '500'
  };

  const greenButtonStyle = {
    padding: '15px 40px', background: '#28a745', color: 'white',
    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 5px 15px rgba(40,167,69,0.3)'
  };

  const blueButtonStyle = {
    padding: '15px 40px', background: '#007bff', color: 'white',
    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,123,255,0.3)'
  };

  const cyanButtonStyle = {
    padding: '15px 40px', background: '#17a2b8', color: 'white',
    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 5px 15px rgba(23,162,184,0.3)'
  };

  const purpleButtonStyle = {
    padding: '15px 40px', background: '#6f42c1', color: 'white',
    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 5px 15px rgba(111,66,193,0.3)'
  };

  const orangeButtonStyle = {
    padding: '15px 40px', background: '#fd7e14', color: 'white',
    border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 5px 15px rgba(253,126,20,0.3)'
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ 
        textAlign: 'center', marginBottom: '40px', background: 'white', 
        padding: '30px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' 
      }}>
        <h1 style={{ fontSize: '32px', color: '#007bff', margin: '0 0 20px 0', fontWeight: 'bold' }}>
          ⚙️ ADMIN FEATURES MENU
        </h1>
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '20px', 
          background: '#f8f9fa', padding: '15px 30px', borderRadius: '15px', 
          marginBottom: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
            👥 Users: {users.length}
          </span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
            💰 Auto PLC Sync
          </span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#17a2b8' }}>
            🔗 420051
          </span>
        </div>
        <button onClick={handleLogout} style={{
          padding: '12px 30px', background: '#dc3545', color: 'white',
          border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
        }}>
          🚪 Logout
        </button>
      </div>

      {/* ERROR */}
      {apiError && (
        <div style={{
          background: '#f8d7da', color: '#721c24', padding: '15px 20px',
          borderRadius: '10px', marginBottom: '25px', borderLeft: '5px solid #dc3545'
        }}>
          ❌ API Error: {apiError}
        </div>
      )}

      {/* CREATE USER */}
      <div style={{
        background: 'white', padding: '30px', borderRadius: '20px',
        marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '26px', marginBottom: '25px', color: '#28a745' }}>➕ Create New User</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
          <input placeholder="User ID (e.g. user5)" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} style={inputStyle} />
          <input placeholder="Password (e.g. 1234)" value={newPassword} type="password" onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
          <button onClick={createUser} disabled={loading} style={greenButtonStyle}>
            {loading ? 'Creating...' : '✅ Create User'}
          </button>
        </div>
      </div>

      {/* UPDATE BALANCE - AUTO PLC 420051 */}
      <div style={{
        background: 'white', padding: '30px', borderRadius: '20px',
        marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '26px', marginBottom: '25px', color: '#007bff' }}>
          💰 Update Balance (Auto PLC 420051)
        </h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={selectStyle}>
            <option value="">Select User</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.id} ({u.balance ?? 0} kWh)
              </option>
            ))}
          </select>
          <input placeholder="New Balance (kWh)" value={newBalance} type="number" step="0.01"
                 onChange={(e) => setNewBalance(e.target.value)} style={inputStyle} />
          <button onClick={updateBalance} disabled={loading || !selectedUser} style={blueButtonStyle}>
            {loading ? 'Updating...' : '🚀 Update + PLC'}
          </button>
        </div>
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          💡 Auto-sends selected user to PLC 420051 register
        </div>
      </div>

      {/* MANUAL SET USER TO PLC */}
      <div style={{
        background: 'white', padding: '30px', borderRadius: '20px',
        marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '26px', marginBottom: '25px', color: '#17a2b8' }}>🔗 Manual PLC 420051</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={selectStyle}>
            <option value="">Select User for PLC</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.id}</option>)}
          </select>
          <button onClick={setUserIdToPLC} disabled={loading || !selectedUser} style={cyanButtonStyle}>
            {loading ? 'Setting...' : '🚀 Send to PLC 420051'}
          </button>
        </div>
      </div>

      {/* PASSWORD & USER ID CHANGE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '26px', marginBottom: '25px', color: '#6f42c1' }}>🔑 Change Password</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <select value={selectedUserForPassword} onChange={(e) => setSelectedUserForPassword(e.target.value)} style={selectStyle}>
              <option value="">Select User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.id}</option>)}
            </select>
            <input placeholder="New Password" value={newPasswordForUser} type="password" onChange={(e) => setNewPasswordForUser(e.target.value)} style={inputStyle} />
            <button onClick={editUserPassword} disabled={loading} style={purpleButtonStyle}>
              {loading ? 'Updating...' : '🔑 Update Password'}
            </button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '26px', marginBottom: '25px', color: '#fd7e14' }}>🆔 Change User ID</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <select value={selectedUserForIdChange} onChange={(e) => setSelectedUserForIdChange(e.target.value)} style={selectStyle}>
              <option value="">Select User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.id}</option>)}
            </select>
            <input placeholder="New User ID" value={newUserIdForUser} onChange={(e) => setNewUserIdForUser(e.target.value)} style={inputStyle} />
            <button onClick={editUserId} disabled={loading} style={orangeButtonStyle}>
              {loading ? 'Updating...' : '🆔 Update User ID'}
            </button>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '26px', marginBottom: '25px', color: '#333' }}>👥 Users List ({users.length})</h2>
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            <h3>No users yet</h3>
            <p>Create your first user above!</p>
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {users.map((user, i) => (
              <div key={i} style={{
                padding: '25px', border: '2px solid #eee', marginBottom: '15px',
                borderRadius: '15px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', background: i % 2 === 0 ? '#f8f9fa' : 'white'
              }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>{user.id}</div>
                  <div style={{ color: '#666', marginTop: '8px' }}>
                    💰 Balance: <span style={{ color: '#28a745', fontSize: '20px', fontWeight: 'bold' }}>{user.balance ?? 0} kWh</span>
                    <span style={{ marginLeft: '20px', color: '#999' }}>🔑 {user.password}</span>
                  </div>
                </div>
                <button onClick={() => deleteUser(user.id)} disabled={loading} style={{
                  background: '#dc3545', color: 'white', border: 'none',
                  padding: '15px 30px', borderRadius: '10px', fontSize: '16px',
                  fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}>
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', color: '#666' }}>
        <h3 style={{ color: '#000', fontWeight: 'bold' }}>ALPHATECH SOLUTIONS</h3>
        <p>EV Charging Station Management System</p>
      </div>
    </div>
  );
};

export default AdminPage;
