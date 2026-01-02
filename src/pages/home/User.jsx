import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Power, Square, Wifi, WifiOff, RotateCcw, AlertCircle, DollarSign, Activity, LogOut } from 'lucide-react';

const UserDashboard = ({ onLogout }) => {
  const [userId, setUserId] = useState(localStorage.getItem('currentUserId') || '');
  const [userBalance, setUserBalance] = useState(parseFloat(localStorage.getItem('userBalance')) || 0);
  const [chargingStatus, setChargingStatus] = useState(null);
  const [kwhConsumed, setKwhConsumed] = useState(null);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const USER_API = "https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1";
  const READ_EV_API = "https://il2iaq42al.execute-api.ap-south-1.amazonaws.com/READ_EV_TABLE";
  const WRITE_EV_API = "https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject";
  const MODBUS_TRIGGER_API = "https://w4fndc7sm6.execute-api.ap-south-1.amazonaws.com/cloud_energyMeter_evPROJECT";

  const fetchUserBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${USER_API}?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.balance !== undefined) {
        setUserBalance(data.balance);
        localStorage.setItem('userBalance', data.balance);
        await writeUserDataToPLC();
      }
    } catch (err) {
      console.error('Balance fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

const writeUserDataToPLC = async () => {
  try {
    // ✅ 420051 = userId (already works)
    // ✅ 420033 = balance (NEW - this was missing)
    await fetch(`${WRITE_EV_API}?address=420051&value=${userId}`, { method: "POST" });
    await fetch(`${WRITE_EV_API}?address=420033&value=${userBalance}`, { method: "POST" });
    console.log('✅ BALANCE to 420033:', { userId, balance: userBalance });
  } catch (err) {
    console.error('PLC balance write error:', err);
  }
};


  const fetchLiveStatus = useCallback(async () => {
    try {
      await fetch(MODBUS_TRIGGER_API, { method: "PUT" });
      await new Promise(r => setTimeout(r, 2000));

      const statusRes = await fetch(`${READ_EV_API}?address=420048&last=1`);
      const statusData = await statusRes.json();
      setChargingStatus(statusData?.[0]?.value ?? null);
      setLastUpdate(statusData?.[0]?.timestamp ?? null);

      const kwhRes = await fetch(`${READ_EV_API}?address=420043&last=1`);
      const kwhData = await kwhRes.json();
      setKwhConsumed(kwhData?.[0]?.value ?? null);

      const now = new Date().getTime();
      const last = statusData?.[0]?.timestamp ? new Date(statusData[0].timestamp).getTime() : 0;
      setDeviceOnline((now - last) / 1000 / 60 <= 3);
    } catch (err) {
      console.error('Status fetch error:', err);
    }
  }, []);

  const startCharging = async () => {
    if (!deviceOnline) return setError('Device offline');
    try {
      setIsLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      await fetch(`${WRITE_EV_API}?address=420030&value=1`, { method: "POST", headers });
      await new Promise(r => setTimeout(r, 5000));
      await fetch(`${WRITE_EV_API}?address=420030&value=0`, { method: "POST", headers });
      fetchLiveStatus();
    } catch (err) {
      setError('Start failed');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCharging = async () => {
    if (!deviceOnline) return setError('Device offline');
    try {
      setIsLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      await fetch(`${WRITE_EV_API}?address=420031&value=1`, { method: "POST", headers });
      await new Promise(r => setTimeout(r, 5000));
      await fetch(`${WRITE_EV_API}?address=420031&value=0`, { method: "POST", headers });
      fetchLiveStatus();
    } catch (err) {
      setError('Stop failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    if (userId) {
      fetchUserBalance();
      fetchLiveStatus();
    }
    const interval = setInterval(fetchLiveStatus, 10000);
    return () => clearInterval(interval);
  }, [userId, fetchUserBalance, fetchLiveStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 p-3 sm:p-4">
      {/* Compact Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg border border-emerald-200 sticky top-0 z-50 rounded-xl mx-1 sm:mx-2">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent truncate">
                  EV Charging Station
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-mono">
                  ID: <span className="bg-emerald-100 px-2 py-0.5 rounded-lg text-emerald-700 font-bold text-xs">{userId}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm ${
                deviceOnline ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {deviceOnline ? <Wifi className="w-3 h-3 inline mr-1" /> : <WifiOff className="w-3 h-3 inline mr-1" />}
                {deviceOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
              <button
                onClick={fetchLiveStatus}
                disabled={isLoading}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5 text-xs sm:text-sm h-9 sm:h-10"
              >
                <RotateCcw className={`w-3 h-3 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-md transition-all flex items-center space-x-1.5 text-xs sm:text-sm h-9 sm:h-10"
              >
                <LogOut className="w-3 h-3 sm:w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto px-1 sm:px-2">
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-red-800 leading-relaxed flex-1">{error}</span>
          </div>
        )}

        {/* ✨ CHARGING STATUS - MOVED ABOVE BUTTONS */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl border border-emerald-200 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Charging Status</h2>
          <div className="flex flex-col lg:flex-row items-center justify-center lg:space-x-6 space-y-4 lg:space-y-0">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-3xl shadow-2xl flex items-center justify-center p-3 transition-all duration-500 border-4 mx-auto ${
              chargingStatus === 1 ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-400 shadow-emerald-500/50' :
              chargingStatus === 0 ? 'bg-gradient-to-br from-red-400 to-red-500 border-red-400 shadow-red-500/50' :
              'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-300 shadow-gray-400/50'
            }`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center ${
                chargingStatus === 1 ? 'bg-white animate-ping shadow-white' : 'bg-white/80 shadow-white/50'
              }`}></div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 capitalize mb-2">
                {chargingStatus === 1 ? 'CHARGING' : chargingStatus === 0 ? 'STOPPED' : 'READY'}
              </div>
              <div className="text-sm sm:text-base font-mono text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl inline-block">
                420048 | {lastUpdate ? new Date(lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* START/STOP BUTTONS - RIGHT BELOW STATUS */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-3 border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 text-center">Charging Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            <button
              onClick={startCharging}
              disabled={isLoading || !deviceOnline || chargingStatus === 1}
              className="group h-24 sm:h-28 lg:h-32 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-[1.03] transition-all duration-300 border-4 border-emerald-400 relative overflow-hidden text-lg sm:text-xl"
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2 p-4">
                <Power className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-2xl group-hover:animate-bounce" />
                <div className="text-center leading-tight">
                  <div>START</div>
                  <div className="text-xs font-mono opacity-90">420030</div>
                </div>
              </div>
            </button>

            <button
              onClick={stopCharging}
              disabled={isLoading || !deviceOnline || chargingStatus === 0}
              className="group h-24 sm:h-28 lg:h-32 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-[1.03] transition-all duration-300 border-4 border-red-400 relative overflow-hidden text-lg sm:text-xl"
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-2 p-4">
                <Square className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-2xl group-hover:animate-bounce" />
                <div className="text-center leading-tight">
                  <div>STOP</div>
                  <div className="text-xs font-mono opacity-90">420031</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Other Cards Below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* MINI Balance */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 sm:p-5 shadow-xl border border-amber-200 text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <DollarSign className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Balance</h3>
              <div className="text-3xl sm:text-4xl font-black text-amber-600 mb-2">₹{userBalance.toFixed(2)}</div>
              <div className="text-xs sm:text-sm font-mono text-gray-600">
                420050: {userId}
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 sm:p-5 shadow-xl border border-green-200 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Energy</h3>
            <div className="text-4xl sm:text-5xl font-black text-green-600 mb-2">{kwhConsumed?.toFixed(3) || '0.000'}</div>
            <div className="text-sm font-mono bg-green-100 px-3 py-1.5 rounded-xl text-green-800 font-semibold inline-block">
              420043 kWh
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xl text-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Sync Status</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <div className="text-lg font-mono font-bold text-blue-700">420050</div>
              <div className="text-xs font-semibold text-gray-700">User ID</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <div className="text-lg font-mono font-bold text-blue-700">420043</div>
              <div className="text-xs font-semibold text-gray-700">Balance</div>
            </div>
          </div>
          <div className="text-sm font-mono text-blue-600 bg-blue-200 px-3 py-1.5 rounded-xl font-semibold inline-block">
            API Sync ✅
          </div>
        </div>

        {isLoading && (
          <div className="p-4 sm:p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-lg sm:text-xl font-semibold text-blue-800">Syncing...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
