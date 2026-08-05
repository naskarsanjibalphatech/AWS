import React, { useState, useEffect } from 'react';
import { User, DollarSign, Trash2, Edit3, LogOut, Zap, AlertCircle, Plus, CheckCircle, Lock } from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [action, setAction] = useState('list');
  const [adminId, setAdminId] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [oldUserId, setOldUserId] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const USER_API = "https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1";

  // ✅ BULLETPROOF Response Parser
  const safeParseResponse = async (response) => {
    try {
      const contentType = response.headers.get('content-type');
      const rawText = await response.text();
      
      if (contentType && contentType.includes('application/json')) {
        return JSON.parse(rawText);
      } else {
        return { message: rawText || 'Server error', success: response.ok };
      }
    } catch (err) {
      return { message: 'Failed to parse response', success: false };
    }
  };

  // ✅ FIXED: List users WITH admin credentials
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "listUsers",
          adminId: adminId,
          adminPassword: adminPassword
        })
      });
      
      const data = await safeParseResponse(response);
      console.log('📋 Users response:', data);
      
      if (response.ok && data.users) {
        setUsers(data.users);
        setSuccess(`✅ Loaded ${data.users.length} users`);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('fetchUsers error:', err);
      setError('Network error loading users');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Universal API with ALL admin credentials
  const executeAdminAction = async (payload) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('🚀 Admin payload:', payload);

      const response = await fetch(USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await safeParseResponse(response);
      console.log('📡 Admin response:', data);

      if (response.ok && data.message) {
        setSuccess(data.message);
        fetchUsers(); // Auto-refresh list
        resetForm();
      } else {
        setError(data.message || `HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Admin action error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ALL HANDLERS WITH ADMIN CREDENTIALS
  const handleCreateUser = () => {
    if (!userId || !password) return setError('User ID and Password required');
    executeAdminAction({
      action: "create",
      adminId, adminPassword,
      userId, password
    });
  };

  const handleUpdateBalance = () => {
    if (!userId || newBalance === '')
        return setError('User ID and New Balance required');

    executeAdminAction({
        action: "rechargeBalance",
        adminId,
        adminPassword,
        userId,
        amount: parseFloat(newBalance)
    });
};

  const handleDeleteUser = () => {
    if (!userId) return setError('User ID required');
    executeAdminAction({
      action: "deleteUser",
      adminId, adminPassword,
      userId
    });
  };

  const handleEditUserId = () => {
    if (!oldUserId || !newUserId) return setError('Old and New User ID required');
    executeAdminAction({
      action: "editUserId",
      adminId, adminPassword,
      oldUserId, newUserId
    });
  };

  const handleChangePassword = () => {

    if (!userId || !newPassword)
        return setError("User ID and New Password required");

    executeAdminAction({
        action: "resetPassword",
        adminId,
        adminPassword,
        userId,
        newPassword
    });

};

  const resetForm = () => {
    setUserId(''); setPassword(''); setNewBalance(''); 
    setOldUserId(''); setNewUserId(''); setNewPassword('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b-2 border-amber-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-amber-800 bg-clip-text text-transparent">
                  EV Admin Panel
                </h1>
                <p className="text-lg text-gray-600 font-semibold">Complete User Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={fetchUsers} disabled={loading} className="flex items-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50">
                <Zap className="w-5 h-5" /><span>Refresh ({users.length})</span>
              </button>
              <button onClick={handleLogout} className="flex items-center space-x-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all">
                <LogOut className="w-5 h-5" /><span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-center animate-pulse">
            <AlertCircle className="w-7 h-7 text-red-500 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-xl text-red-900 mb-1">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-8 bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 flex items-center">
            <CheckCircle className="w-7 h-7 text-emerald-500 mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-xl text-emerald-900 mb-1">Success!</h3>
              <p className="text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User List */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-8 h-8 mr-3 text-amber-600" />
              All Users ({users.length})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-xl">No users found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-l-4 border-emerald-400 hover:shadow-md transition-all">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{user.userId}</div>
                      <div className="text-sm text-gray-600">₹{parseFloat(user.balance || 0).toFixed(2)}</div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Edit3 className="w-8 h-8 mr-3 text-blue-600" />
              Admin Actions
            </h2>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                {key: 'list', label: 'List Users', icon: User, color: 'blue'},
                {key: 'create', label: 'Create User', icon: Plus, color: 'emerald'},
                {key: 'updateBalance', label: 'Add Balance', icon: DollarSign, color: 'amber'},
                {key: 'deleteUser', label: 'Delete User', icon: Trash2, color: 'red'},
                {key: 'editUserId', label: 'Edit User ID', icon: Edit3, color: 'indigo'},
                {key: 'changePassword', label: 'Reset Password', icon: Lock, color: 'purple'}
              ].map(({key, label, icon: Icon, color}) => (
                <button
                  key={key}
                  onClick={() => setAction(key)}
                  className={`p-4 rounded-2xl font-semibold transition-all flex items-center space-x-3 ${
                    action === key
                      ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg shadow-${color}-500/25`
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Forms */}
            <div className="space-y-4">
              {action === 'create' && (
                <>
                  <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user2" className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="1234" className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
                  <button onClick={handleCreateUser} disabled={loading || !userId || !password} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                    {loading ? 'Creating...' : '✅ Create User'}
                  </button>
                </>
              )}

              {action === 'updateBalance' && (
                <>
                  <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user2" className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
                  <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} placeholder="100" className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200" />
                  <button onClick={handleUpdateBalance} disabled={loading || !userId || newBalance === ''} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                    {loading ? 'Updating...' : '💰 Add Balance'}
                  </button>
                </>
              )}

              {action === 'deleteUser' && (
                <>
                  <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user2" className="w-full p-4 border-2 border-red-200 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-200" />
                  <button onClick={handleDeleteUser} disabled={loading || !userId} className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                    {loading ? 'Deleting...' : '🗑️ Delete User'}
                  </button>
                </>
              )}

              {action === 'editUserId' && (
                <>
                  <input type="text" value={oldUserId} onChange={(e) => setOldUserId(e.target.value)} placeholder="user2" className="w-full p-4 border-2 border-gray-200 rounded-2xl" />
                  <input type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="user3" className="w-full p-4 border-2 border-gray-200 rounded-2xl" />
                  <button onClick={handleEditUserId} disabled={loading || !oldUserId || !newUserId} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                    {loading ? 'Updating...' : '🔄 Change User ID'}
                  </button>
                </>
              )}

              {action === 'changePassword' && (
                <>
                  <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user2" className="w-full p-4 border-2 border-gray-200 rounded-2xl" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="newpass123" className="w-full p-4 border-2 border-gray-200 rounded-2xl" />
                  <button onClick={handleChangePassword} disabled={loading || !userId || !newPassword} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
                    {loading ? 'Updating...' : '🔐 Reset Password'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;