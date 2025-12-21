import React, { useState, useEffect } from 'react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    const savedUsers = localStorage.getItem('ev_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  const saveUsers = (userList) => {
    setUsers(userList);
    localStorage.setItem('ev_users', JSON.stringify(userList));
  };

  const createUser = () => {
    if (!newUserId || !newPassword) return alert('Fill all fields');
    if (users.find(u => u.id === newUserId)) return alert('User exists');
    const newUser = { id: newUserId, password: newPassword, balance: 0, role: 'user' };
    saveUsers([...users, newUser]);
    setNewUserId(''); setNewPassword('');
    alert('User created!');
  };

  const updateBalance = () => {
    if (!selectedUser || !newBalance) return alert('Select user + balance');
    const updatedUsers = users.map(user => 
      user.id === selectedUser ? { ...user, balance: parseFloat(newBalance) } : user
    );
    saveUsers(updatedUsers);
    setNewBalance('');
    alert('Balance updated!');
  };

  const deleteUser = (userId) => {
    if (confirm(`Delete ${userId}?`)) {
      saveUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div style={{padding: '40px', maxWidth: '1000px', margin: '0 auto'}}>
      <h1 style={{fontSize: '36px', color: '#333', marginBottom: '40px'}}>🔧 Admin Panel</h1>
      
      {/* CREATE USER */}
      <div style={{background: 'white', padding: '30px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
        <h2 style={{fontSize: '24px', marginBottom: '20px'}}>➕ Create User</h2>
        <input placeholder="User ID" value={newUserId} onChange={e=>setNewUserId(e.target.value)} 
               style={{padding: '12px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '8px', width: '250px'}} />
        <input placeholder="Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} 
               style={{padding: '12px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '8px', width: '250px'}} />
        <button onClick={createUser} style={{padding: '12px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px'}}>
          Create User
        </button>
      </div>

      {/* UPDATE BALANCE */}
      <div style={{background: 'white', padding: '30px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
        <h2 style={{fontSize: '24px', marginBottom: '20px'}}>💰 Update Balance</h2>
        <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} 
                style={{padding: '12px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '8px', width: '250px'}}>
          <option value="">Select User</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.id}</option>)}
        </select>
        <input placeholder="Balance (kWh)" value={newBalance} onChange={e=>setNewBalance(e.target.value)} type="number"
               style={{padding: '12px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '8px', width: '200px'}} />
        <button onClick={updateBalance} style={{padding: '12px 30px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px'}}>
          Update Balance
        </button>
      </div>

      {/* USERS TABLE */}
      <div style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
        <h2>👥 Users ({users.length})</h2>
        {users.length === 0 ? (
          <p>No users. Create some above!</p>
        ) : (
          users.map((user, i) => (
            <div key={i} style={{padding: '20px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '8px'}}>
              <strong>ID:</strong> {user.id} | 
              <strong> Balance:</strong> <span style={{color: 'green', fontSize: '20px'}}>{user.balance} kWh</span> | 
              <strong> Password:</strong> {user.password} | 
              <button onClick={()=>deleteUser(user.id)} style={{background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', marginLeft: '20px'}}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;
