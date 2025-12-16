 import React, { useState, useEffect, useCallback } from "react";
import {
  Power,
  Wifi,
  WifiOff,
  Clock,
  Activity,
  AlertCircle,
  Settings,
} from "lucide-react";

const AlphatechChargingStation = () => {
  const [kwhReading, setKwhReading] = useState(0);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outputStatus, setOutputStatus] = useState(null);
  const [buttonStates, setButtonStates] = useState({});

  // Alphatech Charging Station APIs
  const TRIGGER_API = "https://v9byq51r6l.execute-api.ap-south-1.amazonaws.com/EV_CHARGING";
  const READ_API = "https://il2iaq42al.execute-api.ap-south-1.amazonaws.com/READ_EV_TABLE";
  const WRITE_API = "https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject";
  const KWH_TRIGGER_API = "https://w4fndc7sm6.execute-api.ap-south-1.amazonaws.com/cloud_energyMeter_evPROJECT";

  // Trigger Lambda for kWh updates (PUT method)
  const triggerKwhUpdate = async () => {
    try {
      await fetch(TRIGGER_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("kWh Trigger API error:", err.message);
    }
  };

  // Fetch Output 0 Status
  const fetchOutputStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await triggerKwhUpdate();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(`${READ_API}/?address=0&last=1`).then((res) => res.json());
      const status = response && response.length > 0 ? response[0].value : null;
      const timestamp = response && response.length > 0 ? response[0].timestamp : null;

      setOutputStatus(status);
      setLastUpdate(timestamp);

      const now = new Date().getTime();
      const last = timestamp ? new Date(timestamp).getTime() : 0;
      const diffMinutes = (now - last) / 1000 / 60;
      setDeviceOnline(diffMinutes <= 3);
    } catch (err) {
      setError(err.message);
      setDeviceOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  // ================= kWh READING (FIXED) =================
  const fetchKwhReading = useCallback(async () => {
    try {
      // ✅ Trigger ENERGY METER Lambda
      await fetch(KWH_TRIGGER_API, { method: "PUT" });

      // Wait for DynamoDB write
      await new Promise((r) => setTimeout(r, 2000));

      // ✅ Correct kWh register
      const res = await fetch(`${READ_API}/?address=420007&last=1`);
      const data = await res.json();

      console.log("kWh response:", data);

      const kwh =
        Array.isArray(data) && data.length > 0
          ? Number(data[0].value) || 0
          : 0;

      setKwhReading(kwh);
    } catch (err) {
      console.error("kWh fetch error:", err);
    }
  }, []);

  // Output 0 Control (Charging Start/Stop)
  const sendChargingCommand = async (isStart) => {
    const key = isStart ? "start" : "stop";
    
    try {
      setButtonStates((prev) => ({ ...prev, [key]: true }));

      const onAddress = 1000;  // Output 0 ON
      const offAddress = 1001; // Output 0 OFF

      const preClear = isStart ? offAddress : onAddress;
      const mainAddress = isStart ? onAddress : offAddress;

      // Clear opposite command first
      await fetch(`${WRITE_API}/?address=${preClear}&value=0`, { method: "POST" });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Send main command
      await fetch(`${WRITE_API}/?address=${mainAddress}&value=1`, { method: "POST" });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset pulse
      await fetch(`${WRITE_API}/?address=${mainAddress}&value=0`, { method: "POST" });

      // Trigger data update
      await triggerKwhUpdate();

      // Refresh status after 2 seconds
      setTimeout(() => {
        fetchOutputStatus();
        fetchKwhReading();
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setButtonStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRefresh = () => {
    fetchOutputStatus();
    fetchKwhReading();
  };

  // Auto-refresh every 10 seconds for kWh
  useEffect(() => {
    fetchOutputStatus();
    fetchKwhReading();

    const kwhInterval = setInterval(() => {
      fetchKwhReading();
    }, 10000); // 10 seconds

    const statusInterval = setInterval(() => {
      fetchOutputStatus();
    }, 30000); // 30 seconds for status

    return () => {
      clearInterval(kwhInterval);
      clearInterval(statusInterval);
    };
  }, [fetchOutputStatus, fetchKwhReading]);

  // Status Indicator Component
  const StatusIndicator = ({ status, size = "large" }) => (
    <div
      className={`relative rounded-full border-4 transition-all shadow-lg ${
        size === "large"
          ? "w-24 h-24 border-green-600"
          : "w-12 h-12 border-blue-500"
      } ${status === 1 ? "bg-green-500 shadow-green-300" : "bg-gray-200 border-gray-400"}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`rounded-full ${
            size === "large" ? "w-6 h-6" : "w-3 h-3"
          } ${status === 1 ? "bg-white animate-ping" : "bg-gray-500"}`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Power className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Alphatech EV Station
                </h1>
                <p className="text-sm text-gray-600 font-medium">Smart Charging Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-md ${
                deviceOnline
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
                {deviceOnline ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
                <span>{deviceOnline ? "Online" : "Offline"}</span>
                {lastUpdate && (
                  <span className="ml-2 text-xs opacity-75">({new Date(lastUpdate).toLocaleTimeString()})</span>
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
              >
                <Clock className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900 mb-1">Connection Issue</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CHARGING CONTROL */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Activity className="h-8 w-8 mr-3 text-blue-600" />
            Charging Station Control
          </h2>
          <p className="text-gray-600 mb-8">Output 0 - Main Charging Relay</p>

          {/* Status Indicator */}
          <div className="flex justify-center mb-8">
            <StatusIndicator status={outputStatus} />
          </div>

          {/* Status Badge */}
          <div className="text-center mb-8">
            <span className={`px-6 py-3 rounded-full text-lg font-bold text-white shadow-lg ${
              outputStatus === 1
                ? "bg-gradient-to-r from-emerald-500 to-green-600"
                : "bg-gradient-to-r from-gray-400 to-gray-500"
            }`}>
              {outputStatus === 1 ? "CHARGING ACTIVE" : "STANDBY"}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => sendChargingCommand(true)}
              disabled={buttonStates.start || buttonStates.stop || !deviceOnline}
              className="group relative py-4 px-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {buttonStates.start ? (
                <span className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Starting...
                </span>
              ) : (
                "START CHARGING"
              )}
            </button>

            <button
              onClick={() => sendChargingCommand(false)}
              disabled={buttonStates.start || buttonStates.stop || !deviceOnline}
              className="group relative py-4 px-8 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {buttonStates.stop ? (
                <span className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Stopping...
                </span>
              ) : (
                "STOP CHARGING"
              )}
            </button>
          </div>
        </div>

        {/* kWh METER READING */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="h-8 w-8 mr-3 text-indigo-600" />
            Energy Meter
          </h2>
          
          <div className="text-center">
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-4xl font-bold text-white shadow-2xl mb-4">
              {kwhReading.toFixed(2)} kWh
            </div>
            <p className="text-gray-600 text-lg">Total Energy Delivered</p>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-8 bg-blue-50/80 border-2 border-blue-200 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <span className="text-lg font-semibold text-blue-800">Updating station status...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlphatechChargingStation;
