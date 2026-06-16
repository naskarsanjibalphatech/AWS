import React, { useState, useEffect, useMemo } from 'react';
import {
  User, LogOut, Zap, AlertCircle, Plus, CheckCircle,
  KeyRound, UserPlus, ListFilter, Activity, Gauge,
  LayoutDashboard, Users as UsersIcon, Trash2
} from 'lucide-react';

// ─────────────────────────────────────────────
// CONSTANTS — module level, never recreated
// ─────────────────────────────────────────────
const USER_API = "https://6hmya3a8uj.execute-api.ap-south-1.amazonaws.com/DEFAULT";

const P = {
  bg: '#0a0f1c',
  bgGrid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)',
  surface: '#111a2e',
  surfaceRaised: '#16223a',
  sidebar: '#0d1424',
  inset: '#0d1424',
  border: '#22304a',
  borderSoft: '#1a2640',
  text: '#e7edf7',
  textMuted: '#7e8db0',
  textFaint: '#4d5c7e',
  cyan: '#2dd4ee',
  cyanDim: 'rgba(45,212,238,0.15)',
  green: '#3ddc97',
  greenDim: 'rgba(61,220,151,0.15)',
  red: '#fb6f6f',
  redDim: 'rgba(251,111,111,0.15)',
  amber: '#ffc24b',
  amberDim: 'rgba(255,194,75,0.15)',
  violet: '#9d8cff',
};

const GATE_ROW_DEFS = [
  { key: 'manualMode', label: 'Manual mode' },
  { key: 'olr',        label: 'OLR trip'    },
  { key: 'raising',    label: 'Gate raising' },
  { key: 'closing',    label: 'Gate closing' },
  { key: 'fullClose',  label: 'Full close'   },
];

const HEADINGS = {
  overview: { title: 'Overview',        sub: 'Live snapshot of users and gate status'           },
  users:    { title: 'User management', sub: 'View, create, delete, and reset access for users' },
  gates:    { title: 'Gate status',     sub: 'Real-time monitoring of all canal gates'          },
};

// ─────────────────────────────────────────────
// PURE HELPERS — module level
// ─────────────────────────────────────────────
function ledColor(field, value) {
  const v = String(value).toUpperCase();
  if (field === 'manualMode') return v === 'ON' ? P.amber : P.textFaint;
  if (field === 'olr')        return v === 'ON' ? P.red   : P.green;
  if (field === 'raising')    return (v === 'RAISING' || v === 'RUNNING') ? P.cyan : P.textFaint;
  if (field === 'closing')    return (v === 'CLOSING' || v === 'RUNNING') ? P.cyan : P.textFaint;
  if (field === 'fullClose')  return v === 'ON' ? P.green : P.textFaint;
  return P.textFaint;
}

function iconBadge(color) {
  return { width:38, height:38, borderRadius:9, background:`${color}1A`, border:`1px solid ${color}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 };
}

function buildStyles(w) {
  const mob  = w < 768;
  const narr = w < 640;
  const wide = w >= 900;
  return {
    mob, narr, wide,
    page:        { minHeight:'100vh', display:wide?'flex':'block', background:`${P.bgGrid}, linear-gradient(180deg,${P.bg} 0%,#0c1322 100%)`, backgroundSize:'22px 22px,100% 100%', fontFamily:"'Inter','Segoe UI',sans-serif", color:P.text },
    sidebar:     { width:wide?232:'100%', flexShrink:0, background:P.sidebar, borderRight:wide?`1px solid ${P.borderSoft}`:'none', borderBottom:wide?'none':`1px solid ${P.borderSoft}`, position:wide?'sticky':'static', top:0, height:wide?'100vh':'auto', display:'flex', flexDirection:wide?'column':'row', alignItems:wide?'stretch':'center', padding:wide?'20px 14px':narr?'10px 12px':'12px 16px', gap:wide?4:8, zIndex:50, overflowX:wide?'visible':'auto' },
    logoRow:     { display:'flex', alignItems:'center', gap:12, padding:wide?'6px 10px 18px':0, marginRight:wide?0:10, flexShrink:0 },
    logoBox:     { width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#1f3a63 0%,#0f1c33 100%)', border:`1px solid ${P.cyan}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
    brandTitle:  { fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:700, margin:0, color:P.text },
    brandSub:    { fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:P.cyan, margin:'2px 0 0 0', letterSpacing:'0.16em', textTransform:'uppercase' },
    sideFooter:  { marginTop:'auto', display:'flex', flexDirection:'column', gap:8, paddingTop:14, borderTop:`1px solid ${P.borderSoft}` },
    main:        { flex:1, minWidth:0, padding:narr?16:mob?20:'28px 32px', maxWidth:wide?'none':1100, margin:wide?0:'0 auto' },
    pageHeader:  { marginBottom:mob?16:22 },
    pageTitle:   { fontFamily:"'Space Grotesk',sans-serif", fontSize:narr?18:mob?20:26, fontWeight:700, margin:0 },
    pageSub:     { fontSize:13, color:P.textMuted, margin:'6px 0 0 0' },
    statStrip:   { display:'grid', gridTemplateColumns:mob?'repeat(2,1fr)':'repeat(4,1fr)', gap:mob?10:14, marginBottom:mob?16:22 },
    statCard:    { background:P.surface, border:`1px solid ${P.borderSoft}`, borderRadius:12, padding:mob?'12px 14px':'16px 18px' },
    statLabel:   { fontSize:11, color:P.textMuted, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600, margin:'0 0 6px 0' },
    statValue:   { fontFamily:"'Space Grotesk',monospace", fontSize:mob?22:28, fontWeight:700, margin:0 },
    grid:        { display:'grid', gridTemplateColumns:wide?'1.1fr 0.9fr':'1fr', gap:mob?14:20, marginBottom:mob?14:20 },
    card:        { background:P.surface, borderRadius:14, padding:narr?16:mob?18:24, border:`1px solid ${P.borderSoft}`, boxShadow:'0 10px 30px rgba(0,0,0,0.25)' },
    cardHeader:  { display:'flex', alignItems:'center', gap:12, marginBottom:mob?16:20 },
    cardTitle:   { fontFamily:"'Space Grotesk',sans-serif", fontSize:narr?14:mob?15:18, fontWeight:700, color:P.text, margin:0 },
    cardSub:     { fontSize:11, color:P.textMuted, margin:'2px 0 0 0', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.06em' },
    // ── THE KEY FIX: input/form styles are stable objects ──
    input:       { width:'100%', padding:mob?'10px 12px':'11px 14px', background:P.inset, border:`1px solid ${P.border}`, borderRadius:9, fontSize:mob?13:14, color:P.text, outline:'none', boxSizing:'border-box', fontFamily:"'Inter',sans-serif", transition:'border-color 0.2s ease' },
    formBox:     { display:'flex', flexDirection:'column', gap:12, paddingTop:mob?6:8, borderTop:`1px solid ${P.borderSoft}` },
    btnBase:     { width:'100%', padding:mob?11:12, color:'#06121f', border:'none', borderRadius:9, fontSize:mob?13:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s ease', fontFamily:"'Inter',sans-serif" },
    navList:     { display:'grid', gridTemplateColumns:narr?'1fr':'1fr 1fr', gap:8, marginBottom:mob?16:20 },
    userItem:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:mob?'10px 12px':'13px 16px', background:P.inset, borderRadius:10, border:`1px solid ${P.borderSoft}`, marginBottom:8, fontSize:mob?13:14 },
    gateGrid:    { display:'grid', gridTemplateColumns:narr?'1fr':mob?'repeat(2,1fr)':'repeat(auto-fit,minmax(220px,1fr))', gap:mob?10:14 },
  };
}

async function safeParseResponse(response) {
  try {
    const ct  = response.headers.get('content-type');
    const txt = await response.text();
    if (ct && ct.includes('application/json')) return JSON.parse(txt);
    return { message: txt || 'Server error', success: response.ok };
  } catch {
    return { message: 'Failed to parse response', success: false };
  }
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS — defined OUTSIDE AdminPanel
// This is the core fix. When sub-components are
// defined inside the parent, React creates a new
// component TYPE on every render and unmounts/
// remounts the DOM — killing input focus.
// ─────────────────────────────────────────────

function MessagesBlock({ error, success }) {
  return (
    <>
      {error && (
        <div style={{ marginBottom:18, background:P.redDim, border:`1px solid ${P.red}40`, borderRadius:12, padding:'14px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
          <AlertCircle style={{ width:20, height:20, color:P.red, flexShrink:0, marginTop:2 }} />
          <div>
            <h3 style={{ fontSize:14, fontWeight:700, color:P.red, margin:'0 0 4px 0' }}>Error</h3>
            <p style={{ fontSize:13, color:P.text, margin:0, opacity:0.85 }}>{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div style={{ marginBottom:18, background:P.greenDim, border:`1px solid ${P.green}40`, borderRadius:12, padding:'14px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
          <CheckCircle style={{ width:20, height:20, color:P.green, flexShrink:0, marginTop:2 }} />
          <div>
            <h3 style={{ fontSize:14, fontWeight:700, color:P.green, margin:'0 0 4px 0' }}>Success</h3>
            <p style={{ fontSize:13, color:P.text, margin:0, opacity:0.85 }}>{success}</p>
          </div>
        </div>
      )}
    </>
  );
}

function UsersCard({ users, loading, s }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={iconBadge(P.violet)}><User style={{ width:20, height:20, color:P.violet }} /></div>
        <div>
          <h2 style={s.cardTitle}>All users</h2>
          <p style={s.cardSub}>{users.length} registered</p>
        </div>
      </div>
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
          <div style={{ width:36, height:36, border:`3px solid ${P.borderSoft}`, borderTopColor:P.cyan, borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 20px', color:P.textFaint }}>
          <User style={{ width:40, height:40, margin:'0 auto 14px', opacity:0.4 }} />
          <p style={{ fontSize:14, margin:0 }}>No users found</p>
        </div>
      ) : (
        <div style={{ maxHeight:420, overflowY:'auto' }}>
          {users.map((user, i) => (
            <div key={i} style={s.userItem}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:600, color:P.text }}>{user.userId}</div>
                <div style={{ fontSize:12, color:P.textMuted, marginTop:4 }}>Role: {user.role || 'user'}</div>
              </div>
              <span style={{ padding:'4px 10px', background:P.greenDim, color:P.green, border:`1px solid ${P.green}33`, borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:'0.06em' }}>ACTIVE</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminActionsCard({
  s, action, setAction, loading,
  userId, setUserId, name, setName,
  password, setPassword, role, setRole,
  newPassword, setNewPassword,
  onCreateUser, onDeleteUser, onResetPassword,
}) {
  const navBtn = (key, accent, Icon, label) => (
    <div
      onClick={() => setAction(key)}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:9, border:`1px solid ${action===key ? accent+'55' : P.borderSoft}`, background:action===key ? accent+'1A' : P.inset, color:action===key ? accent : P.textMuted, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.18s ease' }}
    >
      <Icon style={{ width:15, height:15 }} />{label}
    </div>
  );

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={iconBadge(P.cyan)}><Plus style={{ width:20, height:20, color:P.cyan }} /></div>
        <div>
          <h2 style={s.cardTitle}>Admin actions</h2>
          <p style={s.cardSub}>Manage accounts &amp; access</p>
        </div>
      </div>

      <div style={s.navList}>
        {navBtn('list',          P.violet, ListFilter, 'List users')}
        {navBtn('create',        P.green,  UserPlus,   'Create user')}
        {navBtn('deleteUser',    P.red,    Trash2,     'Delete user')}
        {navBtn('resetPassword', P.amber,  KeyRound,   'Reset password')}
      </div>

      {action === 'create' && (
        <div style={s.formBox}>
          <input type="text"     value={userId}   onChange={e => setUserId(e.target.value)}   placeholder="User ID (number only)"    style={s.input} />
          <input type="text"     value={name}     onChange={e => setName(e.target.value)}     placeholder="User name (Ram, Sham...)" style={s.input} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"                 style={s.input} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...s.input, cursor:'pointer' }}>
            <option value="operator">Operator</option>
            <option value="remote">Remote</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={onCreateUser} disabled={loading || !userId || !name || !password}
            style={{ ...s.btnBase, background:P.green, opacity:(loading||!userId||!name||!password)?0.5:1, cursor:(loading||!userId||!name||!password)?'not-allowed':'pointer' }}>
            Create user
          </button>
        </div>
      )}

      {action === 'deleteUser' && (
        <div style={s.formBox}>
          <input type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" style={s.input} />
          <button onClick={onDeleteUser} disabled={loading || !userId}
            style={{ ...s.btnBase, background:P.red, color:'#1c0a0a', opacity:(loading||!userId)?0.5:1, cursor:(loading||!userId)?'not-allowed':'pointer' }}>
            Delete user
          </button>
        </div>
      )}

      {action === 'resetPassword' && (
        <div style={s.formBox}>
          <input type="text"     value={userId}      onChange={e => setUserId(e.target.value)}      placeholder="User ID"      style={s.input} />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" style={s.input} />
          <button onClick={onResetPassword} disabled={loading || !userId || !newPassword}
            style={{ ...s.btnBase, background:P.amber, color:'#241a02', opacity:(loading||!userId||!newPassword)?0.5:1, cursor:(loading||!userId||!newPassword)?'not-allowed':'pointer' }}>
            Reset password
          </button>
        </div>
      )}

      {action === 'list' && (
        <div style={{ paddingTop:8, borderTop:`1px solid ${P.borderSoft}` }}>
          <p style={{ fontSize:12, color:P.textFaint, margin:0, lineHeight:1.6 }}>
            Select an action above to create a user, delete a user, or reset a password.
            The user list reflects the latest data from the server.
          </p>
        </div>
      )}
    </div>
  );
}

function GateStatusCard({ gates, activeGates, tripCount, s }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={iconBadge(P.cyan)}><Activity style={{ width:20, height:20, color:P.cyan }} /></div>
        <div>
          <h2 style={s.cardTitle}>Gate status monitoring</h2>
          <p style={s.cardSub}>{gates.length} gates · {activeGates} active · {tripCount} trip{tripCount===1?'':'s'}</p>
        </div>
      </div>
      <div style={s.gateGrid}>
        {gates.map(gate => {
          const hasTrip = String(gate.olr).toUpperCase() === 'ON';
          return (
            <div key={gate.gate} style={{ background:P.inset, border:`1px solid ${hasTrip?P.red+'55':P.borderSoft}`, borderRadius:12, padding:'14px 16px', transition:'border-color 0.2s ease' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${P.borderSoft}` }}>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, color:P.text, margin:0 }}>Gate {String(gate.gate).padStart(2,'0')}</h3>
                <div style={{ width:9, height:9, borderRadius:'50%', background:hasTrip?P.red:P.green, boxShadow:`0 0 8px 1px ${hasTrip?P.red:P.green}99` }} />
              </div>
              {GATE_ROW_DEFS.map(({ key, label }) => {
                const color  = ledColor(key, gate[key]);
                const isLive = color === P.cyan || (key === 'olr' && hasTrip);
                return (
                  <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', fontSize:12 }}>
                    <span style={{ color:P.textMuted, fontWeight:500 }}>{label}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:600, color, letterSpacing:'0.04em' }}>{gate[key]}</span>
                      <div style={{ width:9, height:9, borderRadius:'50%', background:color, boxShadow:isLive?`0 0 8px 1px ${color}99`:'none', flexShrink:0 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatStrip({ users, gates, activeGates, tripCount, s }) {
  return (
    <div style={s.statStrip}>
      <div style={s.statCard}><p style={s.statLabel}>Total users</p><p style={{ ...s.statValue, color:P.text }}>{users.length}</p></div>
      <div style={s.statCard}><p style={s.statLabel}>Gates online</p><p style={{ ...s.statValue, color:P.text }}>{gates.length}</p></div>
      <div style={s.statCard}><p style={s.statLabel}>Gates active</p><p style={{ ...s.statValue, color:P.cyan }}>{activeGates}</p></div>
      <div style={s.statCard}><p style={s.statLabel}>OLR trips</p><p style={{ ...s.statValue, color:tripCount>0?P.red:P.green }}>{tripCount}</p></div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminPanel = ({ onLogout }) => {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [action,      setAction]      = useState('list');
  const [userId,      setUserId]      = useState('');
  const [name,        setName]        = useState('');
  const [password,    setPassword]    = useState('');
  const [role,        setRole]        = useState('operator');
  const [newPassword, setNewPassword] = useState('');
  const [gates,       setGates]       = useState([]);
  const [view,        setView]        = useState('overview');

  const adminId       = 'admin';
  const adminPassword = 'admin123';

  // Styles computed once on mount
  const s = useMemo(() => buildStyles(window.innerWidth), []);

  const activeGates = gates.filter(g => g.raising==='RAISING'||g.closing==='CLOSING'||g.raising==='RUNNING'||g.closing==='RUNNING').length;
  const tripCount   = gates.filter(g => String(g.olr).toUpperCase()==='ON').length;

  const fetchUsers = async () => {
    try {
      setLoading(true); setError('');
      const res  = await fetch(USER_API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'listUsers', adminId, adminPassword }) });
      const data = await safeParseResponse(res);
      if (data.users) { setUsers(data.users); setSuccess(`Loaded ${data.users.length} users`); }
      else setError(data.message || `Failed to load users (Status: ${res.status})`);
    } catch (err) { setError(`Network error: ${err.message}`); }
    finally { setLoading(false); }
  };

  const execAction = async (payload) => {
    try {
      setLoading(true); setError(''); setSuccess('');
      const res  = await fetch(USER_API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await safeParseResponse(res);
      const ok   = res.ok || res.status === 200;
      const successMsg = data.message && ['success','updated','created','deleted'].some(k => data.message.toLowerCase().includes(k));
      if (ok && data.message || successMsg) {
        setSuccess(data.message);
        setTimeout(fetchUsers, 500);
        setUserId(''); setName(''); setPassword(''); setNewPassword(''); setAction('list');
      } else {
        setError(data.message || `HTTP ${res.status}`);
      }
    } catch (err) { setError(`Network error: ${err.message}`); }
    finally { setLoading(false); }
  };

  const handleCreateUser    = () => { if (!userId||!password) return setError('User ID and Password required'); execAction({ action:'createUser',    adminId, adminPassword, userId, name, password, role }); };
  const handleDeleteUser    = () => { if (!userId)            return setError('User ID required');              execAction({ action:'deleteUser',    adminId, adminPassword, userId }); };
  const handleResetPassword = () => { if (!userId||!newPassword) return setError('User ID and New Password required'); execAction({ action:'resetPassword', adminId, adminPassword, userId, newPassword }); };

  useEffect(() => {
    fetchUsers();
    setGates(Array.from({ length:6 }, (_,i) => ({ gate:i+1, manualMode:'OFF', olr:'OFF', raising:'STOPPED', closing:'STOPPED', fullClose:'OFF' })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navItem = (v, Icon, label) => (
    <div onClick={() => setView(v)} style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:9, border:`1px solid ${view===v?P.cyan+'40':'transparent'}`, background:view===v?P.cyanDim:'transparent', color:view===v?P.cyan:P.textMuted, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.18s ease', whiteSpace:'nowrap', flexShrink:0 }}>
      <Icon style={{ width:16, height:16 }} />{label}
    </div>
  );

  const refreshStyle = { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:9, fontSize:13, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:"'Inter',sans-serif", background:loading?'#1c2940':P.surfaceRaised, color:loading?P.textFaint:P.cyan, border:`1px solid ${loading?P.borderSoft:P.cyan+'40'}`, opacity:loading?0.7:1, transition:'all 0.2s ease' };
  const logoutStyle  = { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'transparent', color:P.red, border:`1px solid ${P.red}40`, borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Inter',sans-serif" };

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.logoRow}>
          <div style={s.logoBox}><Gauge style={{ width:20, height:20, color:P.cyan }} /></div>
          {(s.wide || !s.narr) && <div><p style={s.brandTitle}>Admin Console</p><p style={s.brandSub}>Cloud SCADA</p></div>}
        </div>

        {navItem('overview', LayoutDashboard, 'Overview')}
        {navItem('users',    UsersIcon,       'Users')}
        {navItem('gates',    Activity,        'Gate status')}

        {s.wide ? (
          <div style={s.sideFooter}>
            <button onClick={fetchUsers} disabled={loading} style={refreshStyle}><Zap style={{ width:15, height:15 }} />{loading?'Refreshing…':'Refresh data'}</button>
            <button onClick={() => { localStorage.clear(); if (onLogout) onLogout(); window.location.href='/login'; }} style={logoutStyle}><LogOut style={{ width:15, height:15 }} />Log out</button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:8, marginLeft:'auto', flexShrink:0 }}>
            <button onClick={fetchUsers} disabled={loading} style={{ ...refreshStyle, padding:'8px 12px' }}><Zap style={{ width:14, height:14 }} /></button>
            <button onClick={() => { localStorage.clear(); if (onLogout) onLogout(); window.location.href='/login'; }} style={{ ...logoutStyle, padding:'8px 12px' }}><LogOut style={{ width:14, height:14 }} /></button>
          </div>
        )}
      </aside>

      <main style={s.main}>
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>{HEADINGS[view].title}</h1>
          <p style={s.pageSub}>{HEADINGS[view].sub}</p>
        </div>

        <MessagesBlock error={error} success={success} />

        {view === 'overview' && (
          <>
            <StatStrip users={users} gates={gates} activeGates={activeGates} tripCount={tripCount} s={s} />
            <div style={s.grid}>
              <UsersCard users={users} loading={loading} s={s} />
              <AdminActionsCard
                s={s} action={action} setAction={setAction} loading={loading}
                userId={userId} setUserId={setUserId}
                name={name} setName={setName}
                password={password} setPassword={setPassword}
                role={role} setRole={setRole}
                newPassword={newPassword} setNewPassword={setNewPassword}
                onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} onResetPassword={handleResetPassword}
              />
            </div>
            <GateStatusCard gates={gates} activeGates={activeGates} tripCount={tripCount} s={s} />
          </>
        )}

        {view === 'users' && (
          <div style={s.grid}>
            <UsersCard users={users} loading={loading} s={s} />
            <AdminActionsCard
              s={s} action={action} setAction={setAction} loading={loading}
              userId={userId} setUserId={setUserId}
              name={name} setName={setName}
              password={password} setPassword={setPassword}
              role={role} setRole={setRole}
              newPassword={newPassword} setNewPassword={setNewPassword}
              onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} onResetPassword={handleResetPassword}
            />
          </div>
        )}

        {view === 'gates' && <GateStatusCard gates={gates} activeGates={activeGates} tripCount={tripCount} s={s} />}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${P.textFaint}; }
        input:focus, select:focus { border-color: ${P.cyan}80 !important; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${P.borderSoft}; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default AdminPanel;