import React, { useState, useEffect, useCallback } from "react";
import {
  Power,
  Square,
  RotateCcw,
  Wifi,
  WifiOff,
  Clock,
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

  // FIXED API DECLARATIONS
  const TRIGGER_API =
    "https://v9byq51r6l.execute-api.ap-south-1.amazonaws.com/EV_CHARGING";

  const READ_API =
    "https://il2iaq42al.execute-api.ap-south-1.amazonaws.com/READ_EV_TABLE";

  const WRITE_API =
    "https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject";

  // Trigger API
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

  // Fetch Outputs
  const fetchOutputStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await triggerDataUpdate();
      await new Promise((resolve) => setTimeout(resolve, 3500)); // Faster

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

      // FIXED: Sort timestamps and take latest
      const mostRecent = timestamps
        .filter((ts) => ts !== null)
        .sort((a, b) => new Date(b) - new Date(a))[0];

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

  // Fetch Inputs
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
      console.warn("Input fetch failed:", err.message);
      setInputStatuses(Array(8).fill(null));
    }
  }, []);

  // Pushbutton Command
  const sendPushButtonCommand = async (
    onAddress,
    offAddress,
    coilIndex,
    isStart
  ) => {
    const key = `${coilIndex}_${isStart ? "start" : "stop"}`;

    try {
      setButtonStates((prev) => ({ ...prev, [key]: true }));

      const preClear = isStart ? offAddress : onAddress;
      const mainAddress = isStart ? onAddress : offAddress;

      await fetch(`${WRITE_API}/?address=${preClear}&value=0`, {
        method: "POST",
      });

      await new Promise((resolve) => setTimeout(resolve, 800));

      await fetch(`${WRITE_API}/?address=${mainAddress}&value=1`, {
        method: "POST",
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await fetch(`${WRITE_API}/?address=${mainAddress}&value=0`, {
        method: "POST",
      });

      await triggerDataUpdate();

      setTimeout(() => {
        fetchOutputStatuses();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setButtonStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRefresh = () => {
    fetchOutputStatuses();
    fetchInputStatuses();
  };

  // Auto-load
  useEffect(() => {
    fetchOutputStatuses();
    fetchInputStatuses();

    const interval = setInterval(() => {
      fetchInputStatuses();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchOutputStatuses, fetchInputStatuses]);

  // Status Indicator Component
  const StatusIndicator = ({ status }) => (
    <div
      className={`relative w-16 h-16 rounded-full border-2 transition-all ${
        status === 1
          ? "bg-green-500 border-green-600 shadow-lg shadow-green-300"
          : "bg-gray-300 border-gray-400"
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-3 h-3 rounded-full ${
            status === 1 ? "bg-white animate-pulse" : "bg-gray-600"
          }`}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">PLC Dashboard</h1>
                <p className="text-xs text-gray-500">Cloud SCADA System</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  deviceOnline
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {deviceOnline ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span className="ml-1">
                  {deviceOnline ? "Online" : "Offline"}
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-3 py-1 bg-white border rounded-lg"
              >
                <RotateCcw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>

              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Box */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Output Controls */}
        <h2 className="text-lg font-semibold mb-6">Output Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {outputStatuses.map((status, index) => {
            const onAddress = 1000 + index * 2;
            const offAddress = 1001 + index * 2;

            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Output {index}</h3>
                </div>

                <div className="flex justify-center mb-4">
                  <StatusIndicator status={status} />
                </div>

                <div className="text-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {status === 1 ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    sendPushButtonCommand(onAddress, offAddress, index, true)
                  }
                  disabled={
                    buttonStates[`${index}_start`] ||
                    buttonStates[`${index}_stop`] ||
                    !deviceOnline
                  }
                  className="w-full py-2.5 bg-green-600 rounded-lg text-white mb-2"
                >
                  {buttonStates[`${index}_start`] ? "Starting..." : "START"}
                </button>

                <button
                  onClick={() =>
                    sendPushButtonCommand(onAddress, offAddress, index, false)
                  }
                  disabled={
                    buttonStates[`${index}_start`] ||
                    buttonStates[`${index}_stop`] ||
                    !deviceOnline
                  }
                  className="w-full py-2.5 bg-red-600 rounded-lg text-white"
                >
                  {buttonStates[`${index}_stop`] ? "Stopping..." : "STOP"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Input Status */}
        <h2 className="text-lg font-semibold mt-10 mb-6">Input Status</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {inputStatuses.map((status, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-lg border shadow hover:shadow-md text-center"
            >
              <div className="text-xs text-gray-500 mb-2">I{index}</div>

              <div
                className={`w-6 h-6 mx-auto rounded-full border-2 ${
                  status === 1
                    ? "bg-blue-600 border-blue-500 shadow-md"
                    : "bg-gray-200 border-gray-300"
                }`}
              ></div>

              <div
                className={`text-xs font-bold ${
                  status === 1 ? "text-blue-600" : "text-gray-500"
                } mt-1`}
              >
                {status === 1 ? "ON" : "OFF"}
              </div>
            </div>
          ))}
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="bg-blue-50 border p-4 rounded-lg mt-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-800">
                Updating system status...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLCDashboard;
