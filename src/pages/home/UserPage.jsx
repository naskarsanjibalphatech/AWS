// src/pages/home/UserPage.jsx - BULLETPROOF VERSION
import React, { useState, useEffect, useCallback } from "react";

const APIs = {
  USER: "https://o27vgpfcrh.execute-api.ap-south-1.amazonaws.com/USER_LOGIN_EV_S1",
  READ: "https://il2iaq42al.execute-api.ap-south-1.amazonaws.com/READ_EV_TABLE",
  WRITE: "https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject",
  TRIGGER: "https://w4fndc7sm6.execute-api.ap-south-1.amazonaws.com/cloud_energyMeter_evPROJECT"
};

// ✅ ONLY THESE ADDRESSES EXIST
const ADDRESSES = {
  WALLET: "20044",      // PLC Balance  
  OUTPUT: "20048",     // Status
  START: "420030",
  STOP: "420031",  
  BALANCE: "420033",   // Write balance
  USERID: "420051"     // User ID
};

const UserPage = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [plcBalance, setPlcBalance] = useState(0);
  const [outputStatus, setOutputStatus] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cmdLoading, setCmdLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");

  // 🚫 BLOCK OLD ADDRESSES
  const readAddress = async (address) => {
    // BLOCK 20043/20049 FOREVER
    if (address === "20043" || address === "20049") {
      console.error('🚫 BLOCKED OLD ADDRESS:', address);
      return 0;
    }
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(
        `${APIs.READ}/?address=${address}&last=1`,
        { 
          signal: controller.signal,
          cache: 'no-store'
        }
      );
      clearTimeout(timeout);
      
      if (!res.ok) return 0;
      
      const data = await res.json();
      const value = Array.isArray(data) && data[0]?.value ? Number(data[0].value) : 0;
      
      console.log(`✅ ${address}: ${value}`);
      return value;
    } catch {
      return 0;
    }
  };

  const writeAddress = async (address, value) => {
    if (address === "20043" || address === "20049") {
      console.error('🚫 BLOCKED WRITE TO OLD:', address);
      return;
    }
    await fetch(`${APIs.WRITE}/?address=${address}&value=${value}`, { method: "POST" });
  };

  // LOGIN
  const login = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    
    try {
      // Get balance
      const res = await fetch(APIs.USER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "login", userId, password: "dummy" })
      });
      const data = await res.json();
      const balance = parseFloat(data.balanceKWh) || 0;
      setWalletBalance(balance);
      
      // Sync to PLC
      await Promise.all([
        writeAddress(ADDRESSES.BALANCE, balance),
        writeAddress(ADDRESSES.USERID, userId)
      ]);
      
      // Trigger PLC
      await fetch(APIs.TRIGGER, { method: "PUT" });
      await new Promise(r => setTimeout(r, 1500));
      
      setPlcBalance(await readAddress(ADDRESSES.WALLET));
      
    } catch (err) {
      setError("Sync failed");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // LIVE UPDATE
  const liveUpdate = useCallback(async () => {
    const [status, balance] = await Promise.all([
      readAddress(ADDRESSES.OUTPUT),  // 20048
      readAddress(ADDRESSES.WALLET)   // 2044
    ]);
    setOutputStatus(status);
    setPlcBalance(balance);
    setLastUpdate(new Date().toLocaleTimeString());
  }, []);

  // CHARGE
  const charge = async (start) => {
    setCmdLoading(true);
    try {
      await writeAddress(start ? ADDRESSES.START : ADDRESSES.STOP, 1);
      await fetch(APIs.TRIGGER, { method: "PUT" });
      await new Promise(r => setTimeout(r, 1000));
      liveUpdate();
      alert(start ? '✅ START' : '✅ STOP');
    } catch {}
    setCmdLoading(false);
  };

  useEffect(() => {
    if (userId) {
      login();
      const iv = setInterval(liveUpdate, 2000);
      return () => clearInterval(iv);
    }
  }, [login, liveUpdate, userId]);

  return (
    <div style={{ 
      padding: "30px", maxWidth: "800px", margin: "0 auto", 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh', color: 'white'
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '32px' }}>⚡ EV Station</h1>
      
      <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
        <strong>User:</strong> {userId} → <code>420051</code>
      </div>

      {/* BALANCES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        <div style={{ background: 'white', color: '#333', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
          <h3>💰 DynamoDB</h3>
          <div style={{ fontSize: '36px', color: '#28a745', fontWeight: 'bold' }}>
            {walletBalance.toFixed(2)} kWh
          </div>
        </div>
        <div style={{ background: 'white', color: '#333', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
          <h3>🔌 PLC</h3>
          <div style={{ fontSize: '36px', color: '#007bff', fontWeight: 'bold' }}>
            {plcBalance.toFixed(2)} kWh
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>2044</div>
        </div>
      </div>

      {/* STATUS */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '140px', height: '140px', borderRadius: '50%', margin: '0 auto 15px',
          background: outputStatus ? '#28a745' : '#6c757d',
          border: '8px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 'bold', color: 'white'
        }}>
          {outputStatus ? 'ON' : 'OFF'}
        </div>
        <div style={{ fontSize: '16px' }}>20048 • {lastUpdate}</div>
      </div>

      {/* CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
        <button
          onClick={() => charge(true)}
          disabled={cmdLoading || walletBalance === 0}
          style={{
            padding: '20px 50px', background: '#28a745', color: 'white',
            border: 'none', borderRadius: '15px', fontSize: '20px', fontWeight: 'bold',
            opacity: walletBalance === 0 ? 0.6 : 1, cursor: 'pointer'
          }}
        >
          🚀 START
        </button>
        <button
          onClick={() => charge(false)}
          disabled={cmdLoading}
          style={{
            padding: '20px 50px', background: '#dc3545', color: 'white',
            border: 'none', borderRadius: '15px', fontSize: '20px', fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ⏹️ STOP
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', opacity: 0.7 }}>
        ✅ 20048/2044 ONLY • 20043/20049 BLOCKED
      </div>
    </div>
  );
};

export default UserPage;
