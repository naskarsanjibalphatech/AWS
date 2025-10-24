import React, { useState, useEffect, useCallback } from "react";
import {
  Power,
  Square,
  RotateCcw,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  Settings,
} from "lucide-react";

const PLCDashboard = () => {
  const [outputStatuses, setOutputStatuses] = useState(Array(8).fill(null));
  const [inputStatuses, setInputStatuses] = useState(Array(8).fill(null));
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buttonStates, setButtonStates] = useState({});
  const [kwhValue, setKwhValue] = useState(null);

  // Output Names
  const outputNames = [
    "AC",                // Output0
    "RIGHT LIGHT",       // Output1
    "LEFT LIGHT",        // Output2
    "FAN",               // Output3
    "FRONT & BACK LAMP", // Output4
    "SPARE 5",           // Output5
    "SPARE 6",           // Output6
    "SPARE 7",           // Output7
  ];

  // API Endpoints
  const TRIGGER_API =
    "https://qff7i31wg6.execute-api.ap-south-1.amazonaws.com/CLOUD_TO_DEVICE_HOMEproject";
  const READ_API =
    "https://nxt65br0i9.execute-api.ap-south-1.amazonaws.com/Read_dataFrom_db_home_project";
  const WRITE_API =
    "https://yazjquvlb2.execute-api.ap-south-1.amazonaws.com/WRITE_HOME-PROJECT";

  const KWH_TRIGGER_API =
    "https://2nqtt3api6.execute-api.ap-south-1.amazonaws.com/AwsToUsr_For_kwh_HA/";

  const triggerDataUpdate = async () => {
    try {
      await fetch(`${TRIGGER_API}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("Trigger API error:", err.message);
    }
  };

  const fetchOutputStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await triggerDataUpdate();
      await new Promise((resolve) => setTimeout(resolve, 4000));

      const responses = await Promise.all(
        [...Array(8).keys()].map((i) =>
          fetch(`${READ_API}/?address=${i}&last=1`).then((res) => res.json())
        )
      );

      const statuses = responses.map((data) =>
        data && data.length > 0 ? data[0].value : null
      );
      const timestamps = responses.map((data) =>
        data && data.length > 0 ? data[0].timestamp : null
      );

      setOutputStatuses(statuses);
      const mostRecent = timestamps.find((ts) => ts !== null);
      setLastUpdate(mostRecent);

      const now = new Date().getTime();
      const last = mostRecent ? new Date(mostRecent).getTime() : 0;
      const diffMinutes = (now - last) / 1000 / 60;
      setDeviceOnline(diffMinutes <= 3);
    } catch (err) {
      setError(err.message);
      setDeviceOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInputStatuses = useCallback(async () => {
    try {
      const responses = await Promise.all(
        [...Array(8).keys()].map((i) =>
          fetch(`${READ_API}/?address=${10000 + i}&last=1`).then((res) =>
            res.json()
          )
        )
      );

      const statuses = responses.map((data) =>
        data && data.length > 0 ? data[0].value : null
      );
      setInputStatuses(statuses);
    } catch (err) {
      console.warn("Input status fetch failed:", err.message);
      setInputStatuses(Array(8).fill(null));
    }
  }, []);

  const fetchKwhValue = useCallback(async () => {
    try {
      const response = await fetch(`${READ_API}/?address=30022&last=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        setKwhValue(data[0].value);
      } else {
        setKwhValue(null);
      }
    } catch (err) {
      console.warn("KWH fetch error:", err.message);
      setKwhValue(null);
    }
  }, []);

  const sendPushButtonCommand = async (
    onAddress,
    offAddress,
    coilIndex,
    isStart
  ) => {
    const buttonKey = `${coilIndex}_${isStart ? "start" : "stop"}`;

    try {
      setButtonStates((prev) => ({ ...prev, [buttonKey]: true }));

      const preClearAddress = isStart ? offAddress : onAddress;
      const mainAddress = isStart ? onAddress : offAddress;

      await fetch(`${WRITE_API}/?address=${preClearAddress}&value=0`, {
        method: "POST",
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await fetch(`${WRITE_API}/?address=${mainAddress}&value=1`, {
        method: "POST",
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetch(`${WRITE_API}/?address=${mainAddress}&value=0`, {
        method: "POST",
      });

      await triggerDataUpdate();
      setTimeout(() => {
        fetchOutputStatuses();
        fetchKwhValue();
      }, 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setButtonStates((prev) => ({ ...prev, [buttonKey]: false }));
    }
  };

  const handleRefresh = () => {
    fetchOutputStatuses();
    fetchInputStatuses();
    fetchKwhValue();
  };

  useEffect(() => {
    fetchOutputStatuses();
    fetchInputStatuses();
    fetchKwhValue();

    const interval = setInterval(() => {
      fetchInputStatuses();
      fetchKwhValue();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchOutputStatuses, fetchInputStatuses, fetchKwhValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(KWH_TRIGGER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then(() => console.log("✅ KWH auto-triggered"))
        .catch((err) => console.warn("⚠️ KWH trigger error:", err.message));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const StatusIndicator = ({ status }) => (
    <div
      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-300 ${
        status === 1
          ? `bg-green-500 border-green-600 shadow-lg shadow-green-500/30`
          : `bg-gray-300 border-gray-400`
      }`}
    >
      <div className="absolute inset-2 rounded-full bg-white bg-opacity-20"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
            status === 1 ? "bg-white animate-pulse" : "bg-gray-600"
          }`}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  PLC Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">Cloud SCADA System</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  deviceOnline
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {deviceOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="hidden sm:inline">{deviceOnline ? "Online" : "Offline"}</span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">System Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Energy Meter Reading</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
            <div className="text-4xl font-bold text-blue-600">
              {kwhValue !== null ? `${parseFloat(kwhValue).toFixed(2)} AMP` : "—"}
            </div>
            <p className="text-gray-500 mt-2 text-sm">Modbus Address: 30022</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Output Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {outputStatuses.map((status, index) => {
              const onAddress = 1000 + index * 2;
              const offAddress = 1001 + index * 2;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{outputNames[index] || `Output ${index}`}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{index}</span>
                  </div>

                  <div className="flex justify-center mb-6">
                    <StatusIndicator status={status} />
                  </div>

                  <div className="text-center mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {status === 1 ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => sendPushButtonCommand(onAddress, offAddress, index, true)}
                      disabled={buttonStates[`${index}_start`] || buttonStates[`${index}_stop`] || !deviceOnline}
                      className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                    >
                      <Power className="h-4 w-4 mr-2" />
                      {buttonStates[`${index}_start`] ? "Starting..." : "START"}
                    </button>

                    <button
                      onClick={() => sendPushButtonCommand(onAddress, offAddress, index, false)}
                      disabled={buttonStates[`${index}_start`] || buttonStates[`${index}_stop`] || !deviceOnline}
                      className="w-full flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      {buttonStates[`${index}_stop`] ? "Stopping..." : "STOP"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Input Status</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3">
            {inputStatuses.map((status, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-all hover:scale-105"
              >
                <div className="mb-2">
                  <span className="text-xs text-gray-500 font-mono">I{index}</span>
                </div>
                <div className="flex justify-center mb-2">
                  <div
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      status === 1
                        ? "bg-gradient-to-r from-blue-400 to-blue-600 border-blue-500 shadow-lg shadow-blue-500/50"
                        : "bg-gray-200 border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-full h-full rounded-full ${
                        status === 1 ? "bg-white bg-opacity-30 animate-pulse" : ""
                      }`}
                    ></div>
                  </div>
                </div>
                <div className={`text-xs font-bold ${status === 1 ? "text-blue-600" : "text-gray-500"}`}>
                  {status === 1 ? "ON" : "OFF"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Updating system status...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLCDashboard;
