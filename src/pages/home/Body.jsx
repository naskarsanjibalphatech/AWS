import React, { useState, useEffect, useCallback } from "react";

const AlphatechChargingStation = () => {
  const [kwhReading, setKwhReading] = useState(0);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outputStatus, setOutputStatus] = useState(null);
  const [buttonStates, setButtonStates] = useState({});

  const userRole = localStorage.getItem('userRole') || 'user';

  const TRIGGER_API = "https://v9byq51r6l.execute-api.ap-south-1.amazonaws.com/EV_CHARGING";
  const READ_API = "https://il2iaq42al.execute-api.ap-south-1.amazonaws.com/READ_EV_TABLE";
  const WRITE_API = "https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject";
  const KWH_TRIGGER_API = "https://w4fndc7sm6.execute-api.ap-south-1.amazonaws.com/cloud_energyMeter_evPROJECT";

  const triggerKwhUpdate = async () => {
    try {
      await fetch(TRIGGER_API, { method: "PUT", headers: { "Content-Type": "application/json" } });
    } catch (err) {
      console.warn("kWh Trigger API error:", err.message);
    }
  };

  const fetchKwhReading = useCallback(async () => {
    try {
      await fetch(KWH_TRIGGER_API, { method: "PUT" });
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch(`${READ_API}/?address=420007&last=1`);
      const data = await res.json();
      const kwh = Array.isArray(data) && data.length > 0 ? Number(data[0].value) || 0 : 0;
      setKwhReading(kwh);
    } catch (err) {
      console.error("kWh fetch error:", err);
    }
  }, []);

  const sendChargingCommand = async (isStart) => {
    if (userRole !== 'user') {
      alert('Only users can control charging');
      return;
    }
    try {
      setButtonStates(prev => ({ ...prev, [isStart ? "start" : "stop"]: true }));
      
      const onAddress = 1000;
      const offAddress = 1001;
      const preClear = isStart ? offAddress : onAddress;
      const mainAddress = isStart ? onAddress : offAddress;

      await fetch(`${WRITE_API}/?address=${preClear}&value=0`, { method: "POST" });
      await new Promise(r => setTimeout(r, 500));
      await fetch(`${WRITE_API}/?address=${mainAddress}&value=1`, { method: "POST" });
      await new Promise(r => setTimeout(r, 1000));
      await fetch(`${WRITE_API}/?address=${mainAddress}&value=0`, { method: "POST" });
      
      await triggerKwhUpdate();
      setTimeout(() => fetchKwhReading(), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setButtonStates(prev => ({ ...prev, start: false, stop: false }));
    }
  };

  const handleRefresh = () => {
    fetchKwhReading();
  };

  useEffect(() => {
    fetchKwhReading();
    const interval = setInterval(fetchKwhReading, 10000);
    return () => clearInterval(interval);
  }, [fetchKwhReading]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: 'white', fontSize: '32px', marginBottom: '40px' }}>
          Alphatech EV Charging Station
        </h1>
        
        {userRole === 'user' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '30px' }}>Charging Controls</h2>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                margin: '0 auto', border: '8px solid', 
                background: outputStatus === 1 ? '#28a745' : '#6c757d',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ fontSize: '24px', color: 'white', fontWeight: 'bold' }}>
                  {outputStatus === 1 ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button onClick={() => sendChargingCommand(true)} 
                      style={{ padding: '15px 30px', background: '#28a745', color: 'white', border: 'none', 
                              borderRadius: '10px', fontSize: '18px', cursor: 'pointer' }}>
                START CHARGING
              </button>
              <button onClick={() => sendChargingCommand(false)} 
                      style={{ padding: '15px 30px', background: '#dc3545', color: 'white', border: 'none', 
                              borderRadius: '10px', fontSize: '18px', cursor: 'pointer' }}>
                STOP CHARGING
              </button>
            </div>
          </div>
        )}

        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>Energy Meter</h2>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', color: '#667eea', fontWeight: 'bold', marginBottom: '10px' }}>
              {kwhReading.toFixed(2)} kWh
            </div>
            <p>Total Energy Delivered</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px', color: 'white', fontSize: '18px' }}>
          Current Role: <strong>{userRole.toUpperCase()}</strong>
        </div>
      </div>
    </div>
  );
};

export default AlphatechChargingStation;
