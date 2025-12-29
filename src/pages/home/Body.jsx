// src/pages/home/Body.jsx - WITH KWH BALANCE TILE (420043) + FORCE STATUS LIGHT
import React, { useState, useEffect, useCallback } from "react";

const AlphatechChargingStation = () => {
  const [outputStatus, setOutputStatus] = useState(0);
  const [kwhBalance, setKwhBalance] = useState(0);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buttonStates, setButtonStates] = useState({});

  const userRole = localStorage.getItem('userRole') || 'user';
  const userId = localStorage.getItem('userId') || '';

  // YOUR EXACT API ENDPOINTS
  const READ_API = "https://il2iaq42al.execute-api.ap-south-1.amazonaws.com/READ_EV_TABLE";
  const WRITE_API = "https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject";
  const KWH_TRIGGER_API = "https://w4fndc7sm6.execute-api.ap-south-1.amazonaws.com/cloud_energyMeter_evPROJECT";

  const triggerKwhUpdate = async () => {
    try {
      await fetch(KWH_TRIGGER_API, { method: "PUT" });
    } catch (err) {
      console.warn("kWh Trigger API error:", err.message);
    }
  };

  // FETCH OUTPUT STATUS (420048) + KWH BALANCE (420043)
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Trigger fresh data from PLC
      await triggerKwhUpdate();
      await new Promise(r => setTimeout(r, 2000));

      // Read BOTH output status AND kWh balance in parallel
      const [statusRes, kwhRes] = await Promise.all([
        fetch(`${READ_API}/?address=20048&last=1`),
        fetch(`${READ_API}/?address=20043&last=1`)
      ]);
      
      const statusData = await statusRes.json();
      const kwhData = await kwhRes.json();
      
      const statusValue = Array.isArray(statusData) && statusData.length > 0 ? Number(statusData[0].value) || 0 : 0;
      const balanceValue = Array.isArray(kwhData) && kwhData.length > 0 ? parseFloat(kwhData[0].value) || 0 : 0;
      
      setOutputStatus(statusValue);
      setKwhBalance(balanceValue);

      setDeviceOnline(true);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("Failed to fetch PLC data");
      setDeviceOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [READ_API]);

  // ✅ FIXED: FORCE IMMEDIATE GREEN/GREY STATUS LIGHT
  const sendChargingCommand = async (isStart) => {
    if (userRole !== 'user') {
      alert('Only users can control charging');
      return;
    }

    try {
      setButtonStates(prev => ({ ...prev, [isStart ? "start" : "stop"]: true }));
      
      const startAddress = 420030;
      const stopAddress = 420031;
      const targetAddress = isStart ? startAddress : stopAddress;

      // PLC Write Sequence
      await fetch(`${WRITE_API}/?address=${targetAddress}&value=1`, { method: "POST" });
      await new Promise(r => setTimeout(r, 1000));
      await fetch(`${WRITE_API}/?address=${targetAddress}&value=0`, { method: "POST" });
      
      // ✅ FORCE STATUS + API CHECK - INSTANT GREEN/GREY
      await new Promise(r => setTimeout(r, 1500));
      
      // FORCE IMMEDIATE VISUAL FEEDBACK
      setOutputStatus(isStart ? 1 : 0); // GREEN for START, GREY for STOP
      
      // Check real PLC status after 3s
      setTimeout(async () => {
        try {
          const statusRes = await fetch(`${READ_API}/?address=20049&last=1`);
          const statusData = await statusRes.json();
          const statusValue = Array.isArray(statusData) && statusData.length > 0 ? Number(statusData[0].value) || 0 : 0;
          setOutputStatus(statusValue);
        } catch (err) {
          console.warn('Status check failed:', err);
        }
      }, 3000);
      
      alert(isStart ? '✅ Charging Started!' : '✅ Charging Stopped!');
    } catch (err) {
      setError('Command failed: ' + err.message);
      alert('❌ Command failed!');
    } finally {
      setButtonStates(prev => ({ ...prev, start: false, stop: false }));
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // AUTO REFRESH EVERY 5 SECONDS
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER WITH LOGOUT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', margin: 0 }}>
            Alphatech EV Charging Station
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={handleLogout} style={{
              padding: '10px 20px', background: '#dc3545', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}>
              Logout
            </button>
            <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
              {userRole.toUpperCase()}
            </div>
          </div>
        </div>

        {/* STATUS BAR */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Last Update: {lastUpdate || 'Never'} | 
            Device: <span style={{ color: deviceOnline ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
              {deviceOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </span>
          </div>
          {error && <div style={{ color: '#dc3545', marginTop: '10px', fontWeight: 'bold' }}>{error}</div>}
        </div>

        {/* KWH BALANCE TILE */}
        <div style={{ 
          background: 'linear-gradient(135deg, #28a745, #20c997)', 
          color: 'white', padding: '30px', borderRadius: '20px', 
          marginBottom: '30px', textAlign: 'center', boxShadow: '0 15px 35px rgba(40,167,69,0.4)' 
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '10px' }}>
            Current Wallet Balance
          </div>
          <div style={{ 
            fontSize: '48px', fontWeight: 'bold', marginBottom: '10px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {kwhBalance.toFixed(2)} kWh
          </div>
          <div style={{ fontSize: '18px', opacity: '0.8' }}>
            💰 Available for charging
          </div>
        </div>

        {/* USER CHARGING CONTROLS */}
        {userRole === 'user' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '30px' }}>⚡ Charging Controls</h2>
            
            {/* OUTPUT STATUS LIGHT */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto', 
                border: '8px solid #e9ecef', background: outputStatus === 1 ? '#28a745' : '#6c757d',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '28px', color: 'white', fontWeight: 'bold' }}>
                  {outputStatus === 1 ? 'ON' : 'OFF'}
                </div>
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '16px', color: '#666' }}>Output Status</p>
            </div>

            {/* START/STOP BUTTONS */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                onClick={() => sendChargingCommand(true)} 
                disabled={buttonStates.start || outputStatus === 1 || isLoading}
                style={{ 
                  padding: '18px 40px', background: buttonStates.start ? '#6c757d' : '#28a745', 
                  color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', 
                  fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 25px rgba(40,167,69,0.3)'
                }}
              >
                {buttonStates.start ? 'Starting...' : 'START CHARGING'}
              </button>
              <button 
                onClick={() => sendChargingCommand(false)} 
                disabled={buttonStates.stop || isLoading}
                style={{ 
                  padding: '18px 40px', background: buttonStates.stop ? '#6c757d' : '#dc3545', 
                  color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', 
                  fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 25px rgba(220,53,69,0.3)'
                }}
              >
                {buttonStates.stop ? 'Stopping...' : 'STOP CHARGING'}
              </button>
            </div>
          </div>
        )}

        {/* REFRESH BUTTON */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button onClick={handleRefresh} disabled={isLoading} style={{
            padding: '20px 40px', background: isLoading ? '#6c757d' : '#007bff',
            color: 'white', border: 'none', borderRadius: '15px', fontSize: '20px',
            cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold'
          }}>
            {isLoading ? '🔄 Refreshing...' : '🔄 REFRESH DATA'}
          </button>
          <div style={{ fontSize: '16px', color: '#666', marginTop: '15px' }}>
            Auto-updates every 5s
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlphatechChargingStation;
