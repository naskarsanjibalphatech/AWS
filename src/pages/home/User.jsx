import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Power, Square, Wifi, WifiOff, RotateCcw, AlertCircle, DollarSign, Activity, LogOut, Battery, Gauge } from 'lucide-react';

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
      await fetch(
        `${WRITE_EV_API}?address=420051&value=${userId}&userId=${userId}`,
        { method: "POST" }
      );

      await fetch(
        `${WRITE_EV_API}?address=420033&value=${userBalance}&userId=${userId}`,
        { method: "POST" }
      );

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
      await fetch(
        `${WRITE_EV_API}?address=420030&value=1&userId=${userId}`,
        { method: "POST", headers }
      );

      await new Promise(r => setTimeout(r, 5000));
      await fetch(
        `${WRITE_EV_API}?address=420030&value=0&userId=${userId}`,
        { method: "POST", headers }
      );

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
      await fetch(
        `${WRITE_EV_API}?address=420031&value=1&userId=${userId}`,
        { method: "POST", headers }
      );

      await new Promise(r => setTimeout(r, 5000));
      await fetch(
        `${WRITE_EV_API}?address=420031&value=0&userId=${userId}`,
        { method: "POST", headers }
      );

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
      writeUserDataToPLC();
      fetchLiveStatus();
    }

    const interval = setInterval(fetchLiveStatus, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 lg:p-6 relative overflow-hidden">

      

      <div className="relative z-10 text-black font-bold">

        {/* Futuristic Header */}
        <div className="bg-gray-800 text-white shadow-lg border border-black sticky top-0 z-50 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">



          <div className="px-3 py-3 sm:px-6 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Custom Logo */}
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">

                    <img
  src="/logo_160126.jpeg"
  alt="EV Charging Station Logo"
  className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
/>

                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-red-600">
  EV CHARGE STATION
</h1>

                  <div className="flex items-center space-x-1.5 sm:space-x-2 mt-0.5 sm:mt-1">
                    <span className="text-xs text-red-600 font-mono">USER ID:</span>

                    <span className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-black font-bold text-xs sm:text-sm border border-black">
  {userId}
</span>

                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-1.5 sm:gap-0">
                <div className={`relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg border-2 ${
                  deviceOnline 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-400 shadow-emerald-500/50' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-red-500/50'
                }`}>
                  {deviceOnline && <div className="absolute inset-0 bg-white/20 rounded-lg sm:rounded-xl animate-pulse"></div>}
                  <div className="relative flex items-center space-x-1 sm:space-x-1.5">
                    {deviceOnline ? <Wifi className="w-3 h-3 sm:w-4 sm:h-4" /> : <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden xs:inline">{deviceOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </div>
                </div>
                <button
                  onClick={fetchLiveStatus}
                  disabled={isLoading}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg transition-all disabled:opacity-50 border border-blue-400/50 hover:shadow-blue-500/50 text-xs sm:text-sm"
                >
                  <RotateCcw className={`w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">SYNC</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg transition-all border border-red-400/50 hover:shadow-red-500/50 text-xs sm:text-sm"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-1.5" />
                  <span className="hidden xs:inline">EXIT</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
          {error && (
            <div className="relative p-3 sm:p-4 bg-gradient-to-r from-red-900/80 to-red-800/80 backdrop-blur-xl border border-red-500/50 rounded-xl sm:rounded-2xl flex items-start space-x-2 sm:space-x-3 shadow-2xl">
              <div className="absolute inset-0 bg-red-500/10 rounded-xl sm:rounded-2xl animate-pulse"></div>
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5 relative z-10" />
              <span className="text-xs sm:text-sm font-bold text-red-100 leading-relaxed flex-1 relative z-10">{error}</span>
            </div>
          )}

          {/* Main Charging Status - Hero Section */}
          <div className="relative bg-white border border-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-md">

            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl sm:rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-red-600 mb-1 sm:mb-2">
  CHARGING STATUS
</h2>

                
              </div>

              <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                {/* Animated Charging Indicator */}
                <div className="relative">
                  {/* Outer glow rings */}
                  <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    chargingStatus === 1 ? 'animate-ping bg-emerald-500/30' : ''
                  }`} style={{width: '140px', height: '140px', left: '-10px', top: '-10px'}}></div>
                  
                  {/* Main status circle */}
                  <div className={`relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 border-4 ${
                    chargingStatus === 1 
                      ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 border-emerald-300 shadow-emerald-500/50' 
                      : chargingStatus === 0 
                      ? 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 border-slate-500 shadow-slate-700/50' 
                      : 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-amber-300 shadow-amber-500/50'
                  }`}>
                    <div className="relative">
                      {chargingStatus === 1 && (
                        <Battery className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white drop-shadow-2xl animate-pulse" />
                      )}
                      {chargingStatus === 0 && (
                        <Power className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-slate-300 drop-shadow-2xl" />
                      )}
                      {chargingStatus === null && (
                        <Gauge className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white drop-shadow-2xl" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center">
                  <div className={`text-3xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 tracking-wider ${
                    chargingStatus === 1 
                      ? 'text-transparent bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text animate-pulse' 
                      : chargingStatus === 0 
                      ? 'text-slate-400' 
                      : 'text-transparent bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text'
                  }`}>
                    {chargingStatus === 1 ? 'CHARGING' : chargingStatus === 0 ? 'STOPPED' : 'READY'}
                  </div>
                  {chargingStatus === 1 && (
                    <div className="flex items-center justify-center space-x-2 text-emerald-300">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                      <span className="text-sm sm:text-base lg:text-lg font-bold">ACTIVE SESSION</span>
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                {/* START Button */}
                <button
                  onClick={startCharging}
                  disabled={isLoading || !deviceOnline || chargingStatus === 1}
                  className="group relative h-20 sm:h-24 lg:h-28 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-black rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 border-2 border-emerald-400/50 disabled:border-slate-500 overflow-hidden active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  {!isLoading && !chargingStatus && deviceOnline && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  )}
                  <div className="relative flex flex-col items-center justify-center h-full space-y-1 sm:space-y-2">
                    <Power className="w-7 h-7 sm:w-10 sm:h-10 drop-shadow-lg" />
                    <div className="text-base sm:text-xl tracking-wider">START</div>
                    
                  </div>
                </button>

                {/* STOP Button */}
                <button
                  onClick={stopCharging}
                  disabled={isLoading || !deviceOnline || chargingStatus === 0}
                  className="group relative h-20 sm:h-24 lg:h-28 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-black rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 border-2 border-red-400/50 disabled:border-slate-500 overflow-hidden active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="relative flex flex-col items-center justify-center h-full space-y-1 sm:space-y-2">
                    <Square className="w-7 h-7 sm:w-10 sm:h-10 drop-shadow-lg" />
                    <div className="text-base sm:text-xl tracking-wider">STOP</div>
                    
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Balance Card - Redesigned */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md border border-black overflow-hidden">

            
           
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                  <span className="text-black font-bold text-3xl mr-2">•</span>

                  <h3 className="text-sm sm:text-lg lg:text-xl font-black text-black">
  ACCOUNT BALANCE
</h3>

                </div>
                <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-black mb-1.5 sm:mb-2">
  ₹{userBalance.toFixed(2)}
</div>

                
              </div>
              
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="relative bg-gradient-to-br from-blue-900/80 to-cyan-900/80 backdrop-blur-xl border-2 border-blue-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-2xl">
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl sm:rounded-3xl animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">
                  SYNCING DATA...
                </div>
              </div>
            </div>
          )}
          {/* Footer */}
<div className="mt-8 py-4 text-center border-t border-black">
  <p className="text-sm font-bold text-gray-400">
    Design & Developed By{" "}
    <a
      href="https://www.alphatechsolutions.in"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 font-bold"
    >
      Alphatech Solutions
    </a>
  </p>
</div>


        </div>
      </div>
    </div>
  );
};

export default UserDashboard;