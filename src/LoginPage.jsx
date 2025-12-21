import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const users = {
    admin: { id: 'admin', password: 'admin123', role: 'admin' },
    user1: { id: 'user1', password: '1234', role: 'user' }
  };

  const handleLogin = () => {
    const user = Object.values(users).find(u => u.id === userId && u.password === password);
    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      setError('');
      onLoginSuccess();
      navigate('/dashboard');
    } else {
      setError('Wrong ID or Password');
    }
  };

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f0f2f5'}}>
      <div style={{background:'white', padding:'40px', borderRadius:'12px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', width:'400px'}}>
        <h2 style={{textAlign:'center', marginBottom:'30px', color:'#333', fontSize:'28px'}}>EV Charging Login</h2>
        
        {error && <div style={{background:'red', color:'white', padding:'12px', borderRadius:'8px', marginBottom:'20px', textAlign:'center'}}>{error}</div>}
        
        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', marginBottom:'8px', color:'#555', fontWeight:'bold'}}>User ID:</label>
          <input type="text" value={userId} onChange={(e)=>setUserId(e.target.value)} 
                 style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'16px'}} />
        </div>
        
        <div style={{marginBottom:'30px'}}>
          <label style={{display:'block', marginBottom:'8px', color:'#555', fontWeight:'bold'}}>Password:</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} 
                 style={{width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'6px', fontSize:'16px'}} />
        </div>
        
        <button onClick={handleLogin} 
                style={{width:'100%', padding:'14px', background:'#007bff', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer'}}>
          Login
        </button>
        
        <div style={{marginTop:'20px', fontSize:'14px', textAlign:'center', color:'#666'}}>
          <div><strong>Admin:</strong> admin / admin123</div>
          <div><strong>User:</strong> user1 / 1234</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
