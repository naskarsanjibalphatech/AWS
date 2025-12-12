import React, { useState, useEffect, useCallback } from "react";
import { Activity, RotateCcw, Settings, Moon, Sun } from "lucide-react";

export default function PLCDashboardEV() {
  const [outputStatus, setOutputStatus] = useState(null);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buttonState, setButtonState] = useState(null);
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem("ev_dark_mode");
      return v ? JSON.parse(v) : false;
    } catch (e) {
      return false;
    }
  });

  const TRIGGER_API = "https://v9byq51r6l.execute-api.ap-south-1.amazonaws.com/EV_CHARGING";
  const READ_API = "https://il2iaq42al.execute-api.ap-south-1.amazonaws.com/READ_EV_TABLE";
  const WRITE_API = "https://ru9qsjirhe.execute-api.ap-south-1.amazonaws.com/WRITE_EVproject";

  const toggleDark = () => {
    setDark((d) => {
      const n = !d;
      localStorage.setItem("ev_dark_mode", JSON.stringify(n));
      return n;
    });
  };

  const triggerDataUpdate = async () => {
    try {
      await fetch(`${TRIGGER_API}/`, { method: "PUT", headers: { "Content-Type": "application/json" } });
    } catch (err) {}
  };

  const fetchOutput = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await triggerDataUpdate();
      await new Promise((r) => setTimeout(r, 2500));

      const res = await fetch(`${READ_API}/?address=0&last=1`);
      const data = await res.json();

      const val = data?.length > 0 ? data[0].value : null;
      const ts = data?.length > 0 ? data[0].timestamp : null;

      setOutputStatus(val);
      setLastUpdate(ts);

      const now = Date.now();
      const last = ts ? new Date(ts).getTime() : 0;
      const diffMin = (now - last) / 1000 / 60;

      setDeviceOnline(diffMin <= 3);
    } catch (err) {
      setError(err?.message || "Failed to fetch output");
      setDeviceOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendCommand = async (isStart) => {
    const onAddress = 1000;
    const offAddress = 1001;

    const preClear = isStart ? offAddress : onAddress;
    const main = isStart ? onAddress : offAddress;
    const key = isStart ? "start" : "stop";

    try {
      setButtonState(key);

      await fetch(`${WRITE_API}/?address=${preClear}&value=0`, { method: "POST" });
      await new Promise((r) => setTimeout(r, 700));

      await fetch(`${WRITE_API}/?address=${main}&value=1`, { method: "POST" });
      await new Promise((r) => setTimeout(r, 1200));

      await fetch(`${WRITE_API}/?address=${main}&value=0`, { method: "POST" });
      await triggerDataUpdate();

      setTimeout(fetchOutput, 2000);
    } catch (err) {
      setError(err?.message || "Command failed");
    } finally {
      setButtonState(null);
    }
  };

  useEffect(() => {
    fetchOutput();
    const poll = setInterval(fetchOutput, 15000);
    return () => clearInterval(poll);
  }, [fetchOutput]);

  const formatLast = (ts) => (ts ? new Date(ts).toLocaleString() : "--");

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <div className="max-w-4xl mx-auto p-4">

          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">EV Charging Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">Single Output</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchOutput}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 border rounded-lg shadow-sm"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="text-sm">Refresh</span>
              </button>

              <button onClick={toggleDark} className="p-2 rounded-lg bg-white dark:bg-gray-800 border">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Main Output */}
            <section className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
              <div>
                <h2 className="text-xl font-semibold mb-2">Output Control</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                  Last Update: {formatLast(lastUpdate)}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => sendCommand(true)}
                    disabled={buttonState === "start" || !deviceOnline}
                    className="py-3 rounded-lg text-white bg-green-500 shadow-md disabled:opacity-60"
                  >
                    {buttonState === "start" ? "Starting..." : "START"}
                  </button>

                  <button
                    onClick={() => sendCommand(false)}
                    disabled={buttonState === "stop" || !deviceOnline}
                    className="py-3 rounded-lg text-white bg-red-500 shadow-md disabled:opacity-60"
                  >
                    {buttonState === "stop" ? "Stopping..." : "STOP"}
                  </button>
                </div>
              </div>
            </section>

            {/* Right Panel */}
            <aside className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow flex flex-col gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300">System</div>
                <div className="font-semibold">{deviceOnline ? "Connected" : "Disconnected"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Output State</div>
                <div className="mt-1 font-semibold">{outputStatus === 1 ? "ON" : "OFF"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Last Update</div>
                <div className="mt-1 text-sm">{formatLast(lastUpdate)}</div>
              </div>

              {error && <div className="text-xs text-red-500">{error}</div>}
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
