import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Activity,
  LogOut,
  ArrowUp,
  Square,
  ArrowDown,
  Building2,
  AlertTriangle,
  Waves,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   CONSTANTS
   All static config lives here so it's defined once and reused —
   previously the gate API/thing_name map was copy-pasted into
   handleRaise, handleLower, and handleStop separately.
   ────────────────────────────────────────────────────────────── */

const MAX_POS = 15.3;
const GATE_COUNT = 6;

const initialGates = Array.from({ length: GATE_COUNT }, (_, i) => ({
  id: i + 1,
  position: 0,
  status: "STOP",
  manualMode: false,
  olrTrip: false,
  fullClose: false,
  fullOpen: false,
}));

const GROUPS = [
  { id: "G1", label: "Group 1", sub: "Spillway gates 01–02", ids: [1, 2] },
  { id: "G2", label: "Group 2", sub: "Spillway gates 03–04", ids: [3, 4] },
  { id: "G3", label: "Group 3", sub: "Canal regulator gates 05–06", ids: [5, 6] },
];

// Telemetry read endpoints, polled every 3s for live gate status
const READ_APIS = {
  1: "https://7euqgjdoy4.execute-api.ap-south-1.amazonaws.com/default",
  2: "https://3cc84dflq6.execute-api.ap-south-1.amazonaws.com/DEFAULT",
  3: "https://s7p67i8d81.execute-api.ap-south-1.amazonaws.com/default",
  4: "https://91y6dg15lg.execute-api.ap-south-1.amazonaws.com/default",
  5: "https://51f63jt7ka.execute-api.ap-south-1.amazonaws.com/default",
  6: "https://p23r67v6p4.execute-api.ap-south-1.amazonaws.com/default",
};

// Write endpoints + PLC thing names, used by raise/lower/stop commands
// (this was previously duplicated three times, once per handler)
const GATE_CONFIG = {
  1: { thing_name: "plc1_bounsi",   api: "https://n458o442qk.execute-api.ap-south-1.amazonaws.com/default" },
  2: { thing_name: "test5",         api: "https://crmr2lcju2.execute-api.ap-south-1.amazonaws.com/DEFAULT" },
  3: { thing_name: "plc3_bounsi_1", api: "https://qj0tv4wxta.execute-api.ap-south-1.amazonaws.com/default" },
  4: { thing_name: "plc4_bounsi_1", api: "https://hc0ca0vy9c.execute-api.ap-south-1.amazonaws.com/default" },
  5: { thing_name: "plc5_bounsi_1", api: "https://60ovy44j9a.execute-api.ap-south-1.amazonaws.com/default" },
  6: { thing_name: "plc6_bounsi_1", api: "https://27x4wo32a6.execute-api.ap-south-1.amazonaws.com/default" },
};

// Modbus addresses for each momentary command (write 1, then 0 after 2s)
const COMMAND_ADDRESS = {
  RAISE: 8257,
  STOP: 8258,
  LOWER: 8260,
};

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */

// Sends a momentary pulse command (1 then 0) to a gate's PLC.
// Shared by handleRaise / handleLower / handleStop below.
async function sendGateCommand(gateId, address) {
  const gate = GATE_CONFIG[gateId];
  if (!gate) throw new Error(`No GATE_CONFIG entry for gate ${gateId}`);

  await fetch(gate.api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thing_name: gate.thing_name, address, value: 1 }),
  });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await fetch(gate.api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thing_name: gate.thing_name, address, value: 0 }),
  });
}

/* ──────────────────────────────────────────────────────────────
   GATE VISUALIZATION — SCADA-style vertical lift gate mimic
   ────────────────────────────────────────────────────────────── */

function GateVisualization({ gate }) {
  const W = 360, H = 220;
  const MAX_H = 130;
  const pierW = 20, gateW = 110;
  const cx = W / 2;
  const deckY = 18;
  const sillY = H - 18;

  const openPct = gate.position / MAX_POS;
  const gateTopY = deckY + 10 + (1 - openPct) * MAX_H;
  const clampedGateTop = Math.min(gateTopY, sillY - 4);
  const gateH = Math.max(4, sillY - clampedGateTop);

  const leftPier = cx - gateW / 2 - pierW;
  const rightPier = cx + gateW / 2;

  const running = gate.status !== "STOP";
  const raising = gate.status === "RAISING";
  const lowering = gate.status === "LOWERING";

  const hoistStyle = raising
    ? { animation: "hoist-up 1s ease-in-out infinite" }
    : lowering
    ? { animation: "hoist-down 1s ease-in-out infinite" }
    : {};

  const ribCount = 5;
  const ribs = Array.from({ length: ribCount }, (_, i) => clampedGateTop + (gateH / (ribCount + 1)) * (i + 1));

  const upstreamY = deckY + 38;
  const downstreamY = sillY - 8 - openPct * 38;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={`water-${gate.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e5a7a" />
          <stop offset="100%" stopColor="#123a52" />
        </linearGradient>
        <pattern id={`hatch-${gate.id}`} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="none" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#3a4a5a" strokeWidth="1.5" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill="#0a1620" />

      {/* Upstream water */}
      <rect x="0" y={upstreamY} width={leftPier} height={sillY - upstreamY} fill={`url(#water-${gate.id})`} />
      <line x1="0" y1={upstreamY} x2={leftPier} y2={upstreamY} stroke="#3aa0d0" strokeWidth="1.2" opacity="0.7" />

      {/* Downstream water */}
      <rect x={rightPier + pierW} y={downstreamY} width={W - rightPier - pierW} height={sillY - downstreamY} fill={`url(#water-${gate.id})`} opacity={running ? 0.9 : 0.5} />
      {running && (
        <line x1={rightPier + pierW} y1={downstreamY} x2={W} y2={downstreamY} stroke="#3aa0d0" strokeWidth="1.2" opacity="0.7" />
      )}

      {/* Deck / abutments */}
      <rect x="0" y="0" width={W} height={deckY} fill="#2a3644" />
      <rect x="0" y={sillY} width={W} height={H - sillY} fill="#39495a" />

      {/* Sill slab */}
      <rect x={leftPier} y={sillY - 5} width={gateW + pierW * 2} height="5" fill="#4a5d70" />

      {/* Piers */}
      <rect x={leftPier} y={deckY} width={pierW} height={sillY - deckY} fill="#5c6f82" stroke="#3a4a5a" strokeWidth="1" />
      <rect x={leftPier + pierW - 5} y={deckY} width="5" height={sillY - deckY} fill={`url(#hatch-${gate.id})`} />
      <rect x={rightPier} y={deckY} width={pierW} height={sillY - deckY} fill="#5c6f82" stroke="#3a4a5a" strokeWidth="1" />
      <rect x={rightPier} y={deckY} width="5" height={sillY - deckY} fill={`url(#hatch-${gate.id})`} />

      {/* Gate slot */}
      <rect x={cx - gateW / 2} y={deckY} width={gateW} height={sillY - deckY} fill="#0e1f2c" opacity="0.6" />

      {/* Water inside slot */}
      <rect
        x={cx - gateW / 2}
        y={Math.max(downstreamY, deckY)}
        width={gateW}
        height={Math.max(0, sillY - Math.max(downstreamY, deckY))}
        fill={`url(#water-${gate.id})`}
        opacity="0.55"
      />

      {/* Gate leaf */}
      <g style={hoistStyle}>
        <rect
          x={cx - gateW / 2 + 2}
          y={clampedGateTop}
          width={gateW - 4}
          height={gateH}
          fill="#b5532f"
          stroke="#7a3a1f"
          strokeWidth="1.5"
          rx="1"
        />
        <rect x={cx - gateW / 2 + 2} y={clampedGateTop} width={(gateW - 4) / 2} height={gateH} fill="#c9663f" opacity="0.5" />
        {ribs.map((y, i) => (
          <rect key={i} x={cx - gateW / 2 + 2} y={y - 2} width={gateW - 4} height="4" fill="#7a3a1f" />
        ))}
        <rect x={cx - gateW / 2} y={clampedGateTop - 2} width={gateW} height="6" fill="#d97a4f" stroke="#7a3a1f" strokeWidth="1" rx="1" />
        <rect x={cx - gateW / 2 + 2} y={clampedGateTop + gateH - 4} width={gateW - 4} height="5" fill="#8a4426" />
        {[0.2, 0.5, 0.8].map((fx, i) =>
          ribs.map((ry, j) => (
            <circle key={`${i}-${j}`} cx={cx - gateW / 2 + 2 + (gateW - 4) * fx} cy={ry} r="1.5" fill="#5a2a14" />
          ))
        )}
      </g>

      {/* Wire ropes */}
      <line x1={cx - 20} y1="6" x2={cx - 20} y2={clampedGateTop - 1} stroke="#9fb0bf" strokeWidth="1.8" strokeDasharray="2,2" />
      <line x1={cx + 20} y1="6" x2={cx + 20} y2={clampedGateTop - 1} stroke="#9fb0bf" strokeWidth="1.8" strokeDasharray="2,2" />

      {/* Gantry */}
      <rect x={cx - 44} y="0" width="88" height="14" fill="#1f2933" stroke="#3a4a5a" strokeWidth="1" />
      <rect x={cx - 32} y="2" width="64" height="10" fill="#141c24" rx="1" />
      <circle cx={cx - 20} cy="7" r="4" fill="#5c6f82" stroke="#9fb0bf" strokeWidth="0.8" />
      <circle cx={cx + 20} cy="7" r="4" fill="#5c6f82" stroke="#9fb0bf" strokeWidth="0.8" />

      {/* Status lamp */}
      <circle
        cx={cx}
        cy="7"
        r="4.5"
        fill={gate.olrTrip ? "#f87171" : raising ? "#34d399" : lowering ? "#fbbf24" : "#3a4a5a"}
        stroke="#0a1620"
        strokeWidth="1"
      >
        {running && (
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Gate ID tag */}
      <text x={leftPier - 3} y={deckY + 13} textAnchor="end" fontSize="9" fill="#7a8a9a" fontFamily="monospace">
        G{String(gate.id).padStart(2, "0")}
      </text>

      {/* Open % label on right side */}
      <text x={rightPier + pierW + 6} y={clampedGateTop + 4} fontSize="9" fill="#ffe04d" fontFamily="monospace" opacity="0.85">
        {(openPct * 100).toFixed(0)}%
      </text>

      {/* OLR trip overlay */}
      {gate.olrTrip && (
        <>
          <rect x="0" y="0" width={W} height={H} fill="#f87171" opacity="0.06">
            <animate attributeName="opacity" values="0.06;0.18;0.06" dur="0.9s" repeatCount="indefinite" />
          </rect>
          <rect x={cx - 48} y={H / 2 - 12} width="96" height="24" fill="#3a0e0e" stroke="#f87171" strokeWidth="1" rx="3" />
          <text x={cx} y={H / 2 + 5} textAnchor="middle" fontSize="12" fill="#f87171" fontFamily="monospace" fontWeight="700" letterSpacing="1">
            OLR TRIP
          </text>
        </>
      )}

      {/* Position scale on left side */}
      <text x={leftPier - 3} y={deckY + MAX_H * 0.1 + 10} textAnchor="end" fontSize="8" fill="#4a5a6a" fontFamily="monospace">10m</text>
      <text x={leftPier - 3} y={deckY + MAX_H * 0.6 + 10} textAnchor="end" fontSize="8" fill="#4a5a6a" fontFamily="monospace">5m</text>
      <text x={leftPier - 3} y={sillY - 4} textAnchor="end" fontSize="8" fill="#4a5a6a" fontFamily="monospace">0m</text>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
   ────────────────────────────────────────────────────────────── */

export default function OperatorDashboard() {
  const [gates, setGates] = useState(initialGates);
  const [now, setNow] = useState(new Date());

  // Clock tick — updates the header time/date display every second
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Telemetry polling — pulls live gate status every 3s
  useEffect(() => {
    const loadGateData = async () => {
      try {
        const gatePromises = [1, 2, 3, 4, 5, 6].map(async (gateId) => {
          const response = await fetch(READ_APIS[gateId]);
          const json = await response.json();
          return { gateId, data: json.data };
        });
        const results = await Promise.all(gatePromises);
        setGates((prev) =>
          prev.map((gate) => {
            const gateData = results.find((r) => r.gateId === gate.id)?.data || {};
            return {
              ...gate,
              position: Number(gateData["40513"]?.value || 0),
              status:
                gateData["8193"]?.value === 1
                  ? "RAISING"
                  : gateData["8194"]?.value === 1
                  ? "LOWERING"
                  : "STOP",
              manualMode: gateData["10002"]?.value === 1,
              // 10003 is a healthy signal, not a trip signal:
              // 1 = healthy, 0 = trip — so olrTrip is true only when the value is 0
              olrTrip: gateData["10003"]?.value === 0,
              fullClose: gateData["10007"]?.value === 1,
              fullOpen: gateData["10008"]?.value === 1,
            };
          })
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadGateData();
    const timer = setInterval(loadGateData, 3000);
    return () => clearInterval(timer);
  }, []);

  // Command handlers — all three delegate to the shared sendGateCommand helper
  const handleRaise = async (id) => {
    try {
      await sendGateCommand(id, COMMAND_ADDRESS.RAISE);
      alert(`Gate ${id} Raise Command Sent`);
    } catch (error) {
      console.error(error);
      alert("Raise Error");
    }
  };

  const handleLower = async (id) => {
    try {
      await sendGateCommand(id, COMMAND_ADDRESS.LOWER);
      alert(`Gate ${id} Lower Command Sent`);
    } catch (error) {
      console.error(error);
      alert("Lower Error");
    }
  };

  const handleStop = async (id) => {
    try {
      await sendGateCommand(id, COMMAND_ADDRESS.STOP);
      alert(`Gate ${id} Stop Command Sent`);
    } catch (error) {
      console.error(error);
      alert("Stop Error");
    }
  };

  const toggleFlag = (id, flag) => {
    setGates((prev) => prev.map((g) => (g.id === id ? { ...g, [flag]: !g[flag] } : g)));
  };

  // Derived values used across the render
  const activeCount = gates.filter((g) => g.status !== "STOP").length;
  const tripCount = gates.filter((g) => g.olrTrip).length;
  const stoppedCount = gates.filter((g) => g.status === "STOP").length;
  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const gateById = (id) => gates.find((g) => g.id === id);

  return (
    <div className="db-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          --bg:       #060a0f;
          --surf:     #0c121b;
          --surf2:    #101a26;
          --bdr:      #1a2735;
          --bdr2:     #243347;
          --text:     #dde6f0;
          --dim:      #5f7587;
          --mid:      #8fa3b8;
          --green:    #34d399;
          --green-bg: #07261a;
          --green-bd: #1a4a32;
          --red:      #f87171;
          --red-bg:   #2a0a0a;
          --red-bd:   #5a1a1a;
          --amber:    #fbbf24;
          --amber-bg: #2a1e05;
          --amber-bd: #4a3a0a;
          --blue:     #38b6ff;
          --blue-bg:  #061c2e;
          --blue-bd:  #1a3a5a;
          --mono: 'JetBrains Mono', monospace;
          --sans: 'Inter', sans-serif;
          font-family: var(--sans);
          background: var(--bg);
          background-image: radial-gradient(circle at 50% -10%, rgba(56,182,255,0.06), transparent 45%);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* TOP BAR */
        .db-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 62px;
          background: var(--surf); border-bottom: 1px solid var(--bdr); flex-shrink: 0;
        }
        .db-brand { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 700; letter-spacing: .2px; }
        .db-brand-icon {
          width: 34px; height: 34px; border-radius: 8px;
          background: var(--blue-bg); border: 1px solid var(--blue-bd);
          display: flex; align-items: center; justify-content: center; color: var(--blue); flex-shrink: 0;
        }
        .db-brand-sub { font-size: 12px; color: var(--dim); font-weight: 400; margin-left: 4px; }
        .db-topbar-right { display: flex; align-items: center; gap: 18px; }
        .db-clock { font-family: var(--mono); font-size: 12px; color: var(--dim); text-align: right; line-height: 1.5; }
        .db-clock .t { font-size: 16px; color: var(--mid); }
        .db-logout {
          display: flex; align-items: center; gap: 7px;
          background: transparent; border: 1px solid var(--bdr2); color: var(--mid);
          font-family: var(--sans); font-size: 13px; font-weight: 500;
          padding: 7px 14px; border-radius: 8px; cursor: pointer; transition: border-color .15s, color .15s;
        }
        .db-logout:hover { border-color: var(--red); color: var(--red); }

        /* BANNER */
        .db-banner {
          display: flex; align-items: center; gap: 10px;
          margin: 18px 32px 0; padding: 12px 18px;
          background: var(--green-bg); border: 1px solid var(--green-bd); border-radius: 10px;
          font-size: 13px; color: var(--green);
        }
        .db-banner.warn { background: var(--red-bg); border-color: var(--red-bd); color: var(--red); }
        .db-banner .bt { font-weight: 600; }
        .db-banner .bd { color: rgba(52,211,153,.6); font-size: 12px; }
        .db-banner.warn .bd { color: rgba(248,113,113,.65); }

        /* KPI ROW */
        .db-kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; padding: 18px 32px 0; }
        .db-kpi {
          background: var(--surf); border: 1px solid var(--bdr); border-radius: 10px;
          padding: 16px 18px; position: relative; overflow: hidden;
        }
        .db-kpi::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--ac, var(--bdr2)); border-radius: 2px 2px 0 0;
        }
        .db-kpi.bl{--ac:var(--blue)} .db-kpi.gr{--ac:var(--green)}
        .db-kpi.am{--ac:var(--amber)} .db-kpi.rd{--ac:var(--red)}
        .db-kpi-lbl { font-size: 10px; letter-spacing: .8px; text-transform: uppercase; color: var(--dim); margin-bottom: 8px; }
        .db-kpi-val { font-family: var(--mono); font-size: 28px; font-weight: 700; color: var(--text); line-height: 1; }
        .db-kpi-val.bl{color:var(--blue)} .db-kpi-val.gr{color:var(--green)}
        .db-kpi-val.am{color:var(--amber)} .db-kpi-val.rd{color:var(--red)}
        .db-kpi-sub { font-size: 10px; color: var(--dim); margin-top: 5px; }

        /* SECTION HEAD */
        .db-sec { display: flex; align-items: center; justify-content: space-between; padding: 26px 32px 14px; }
        .db-sec h2 { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; letter-spacing: .3px; }
        .db-sec h2 svg { color: var(--dim); }
        .db-sec .sub { font-size: 11px; color: var(--dim); font-weight: 400; margin-left: 2px; }
        .db-sec span.meta { font-size: 11px; color: var(--dim); }

        /* GROUP BLOCK */
        .db-group {
          margin: 0 32px 28px;
          border: 1px solid var(--bdr); border-radius: 14px; overflow: hidden;
          background: linear-gradient(180deg, rgba(56,182,255,0.02), transparent 60%);
        }
        .db-group-hd {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; background: var(--surf2); border-bottom: 1px solid var(--bdr);
        }
        .db-group-hd .gh-left { display: flex; align-items: center; gap: 12px; }
        .db-group-badge {
          font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: 1px;
          padding: 5px 12px; border-radius: 6px; background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue-bd);
        }
        .db-group-title { font-size: 13px; font-weight: 600; }
        .db-group-sub { font-size: 11px; color: var(--dim); }
        .db-group-stat { font-family: var(--mono); font-size: 11px; color: var(--dim); display: flex; gap: 16px; }
        .db-group-stat b { color: var(--mid); }

        /* GATE GRID */
        .db-gate-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
          padding: 28px;
        }

        /* GATE CARD */
        .db-card {
          background: var(--surf); border: 1px solid var(--bdr); border-radius: 14px; overflow: hidden;
          transition: border-color .2s;
        }
        .db-card.active  { border-color: var(--green-bd); }
        .db-card.tripped { border-color: var(--red-bd); box-shadow: 0 0 0 1px var(--red-bd); }

        .db-card-hd {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 16px; border-bottom: 1px solid var(--bdr); background: var(--surf2);
        }
        .db-card-id { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .db-card-id .num { font-family: var(--mono); font-size: 11px; color: var(--dim); }

        /* STATUS BAR — prominent status row below header */
        .db-status-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--bdr);
          background: var(--bg);
        }
        .db-status-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--dim); }
        .db-status-value {
          font-family: var(--mono); font-size: 11px; font-weight: 700;
          display: flex; align-items: center; gap: 7px;
        }
        .db-status-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--bdr2); flex-shrink: 0;
        }
        .db-status-dot.RAISING  { background: var(--green); box-shadow: 0 0 6px var(--green); animation: dp 1.2s ease-in-out infinite; }
        .db-status-dot.LOWERING { background: var(--amber); box-shadow: 0 0 6px var(--amber); animation: dp 1.2s ease-in-out infinite; }
        .db-status-dot.STOP     { background: var(--bdr2); }
        .db-status-dot.TRIP     { background: var(--red); box-shadow: 0 0 6px var(--red); animation: dp 0.9s ease-in-out infinite; }
        .db-status-text.RAISING  { color: var(--green); }
        .db-status-text.LOWERING { color: var(--amber); }
        .db-status-text.STOP     { color: var(--dim); }
        .db-status-text.TRIP     { color: var(--red); }

        .db-chip {
          font-family: var(--mono); font-size: 9px; font-weight: 700;
          letter-spacing: 1px; padding: 3px 10px; border-radius: 20px;
          background: var(--surf); color: var(--dim); border: 1px solid var(--bdr2);
        }
        .db-chip.RAISING  { background:var(--green-bg); color:var(--green); border-color:var(--green-bd); animation:cp 1.6s ease-in-out infinite; }
        .db-chip.LOWERING { background:var(--amber-bg); color:var(--amber); border-color:var(--amber-bd); animation:cp 1.6s ease-in-out infinite; }

        /* VISUALIZATION */
        .db-viz {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: #0a1620;
        }

        /* LCD */
        .db-lcds { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--bdr); }
        .db-lcd { background: var(--surf2); border: 1px solid var(--bdr); border-radius: 8px; padding: 9px 12px; }
        .db-lcd .ll { font-size: 9px; letter-spacing: 1.1px; text-transform: uppercase; color: var(--dim); margin-bottom: 4px; }
        .db-lcd .lv { font-family: var(--mono); font-size: 17px; font-weight: 700; color: var(--green); }
        .db-lcd .lv small { font-size: 11px; font-weight: 500; color: var(--dim); }
        .db-lcd input {
          width: 100%; background: transparent; border: none; outline: none;
          font-family: var(--mono); font-size: 17px; font-weight: 700; color: var(--amber); padding: 0;
        }
        .db-lcd.setpoint { border-color: var(--amber-bd, var(--bdr)); }

        /* FLAGS */
        .db-flags { display: flex; flex-direction: column; gap: 6px; padding: 12px 16px 14px; }
        .db-flag { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--mid); }
        .db-flag.clickable { cursor: pointer; }
        .db-flag.clickable:hover { color: var(--text); }
        .db-fval { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 10px; letter-spacing: .6px; color: var(--dim); }
        .db-fval.on   { color: var(--green); font-weight: 700; }
        .db-fval.warn { color: var(--red);   font-weight: 700; }
        .db-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--bdr2); flex-shrink: 0; }
        .db-dot.on   { background: var(--green); }
        .db-dot.warn { background: var(--red); }
        .db-dot.pulse { animation: dp 1.4s ease-in-out infinite; }

        /* CONTROLS */
        .db-controls {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
          padding: 6px 16px 16px;
        }
        .db-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 11px 0; border-radius: 9px; font-weight: 600; font-size: 13px; letter-spacing: .5px;
          border: 1px solid var(--bdr2); background: var(--surf2); color: var(--text);
          cursor: pointer; transition: transform .06s ease, background .15s ease, border-color .15s ease, color .15s ease;
          font-family: var(--sans);
        }
        .db-btn:active { transform: translateY(1px); }
        .db-btn.raise:hover, .db-btn.raise.active { background: var(--green-bg); border-color: var(--green-bd); color: var(--green); }
        .db-btn.lower:hover, .db-btn.lower.active { background: var(--amber-bg); border-color: var(--amber-bd); color: var(--amber); }
        .db-btn.stop:hover, .db-btn.stop.active   { background: var(--red-bg);   border-color: var(--red-bd);   color: var(--red); }

        /* FOOTER */
        .db-footer {
          border-top: 1px solid var(--bdr); padding: 13px 32px;
          font-size: 11px; color: var(--dim);
          display: flex; justify-content: space-between; margin-top: auto;
        }

        /* ANIMATIONS */
        @keyframes cp { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes dp { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes hoist-up   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes hoist-down { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }

        @media (max-width: 900px) {
          .db-kpi-row { grid-template-columns: repeat(2,1fr); }
          .db-topbar,.db-banner,.db-kpi-row,.db-sec,.db-footer { padding-left:18px; padding-right:18px; }
          .db-group { margin-left:18px; margin-right:18px; }
          .db-gate-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; padding: 18px; }
        }

        @media (max-width: 640px) {
          .db-topbar { height: auto; flex-wrap: wrap; padding: 10px 14px; gap: 8px; }
          .db-brand { font-size: 13px; }
          .db-topbar-right { gap: 10px; margin-left: auto; }
          .db-banner { margin: 12px 14px 0; padding: 9px 12px; }
          .db-kpi-row { grid-template-columns: repeat(2,1fr); gap: 10px; padding: 14px 14px 0; }
          .db-kpi { padding: 12px 14px; }
          .db-kpi-val { font-size: 22px; }
          .db-sec { padding: 18px 14px 10px; flex-direction: column; align-items: flex-start; gap: 4px; }
          .db-group { margin: 0 14px 18px; border-radius: 10px; }
          .db-group-hd { padding: 10px 14px; flex-direction: column; align-items: flex-start; gap: 8px; }
          .db-gate-grid { grid-template-columns: 1fr; padding: 14px; gap: 20px; }
          .db-viz { height: 200px; }
          .db-footer { padding: 10px 14px; font-size: 10px; flex-direction: column; gap: 4px; }
        }

        @media (max-width:520px) { .db-brand-sub { display:none; } }
      `}</style>

      {/* TOP BAR */}
      <header className="db-topbar">
        <div className="db-brand">
          <div className="db-brand-icon"><Building2 size={16} /></div>
          Barrage Gate SCADA — Operator
          <span className="db-brand-sub">· Full control · Live</span>
        </div>
        <div className="db-topbar-right">
          <div className="db-clock">
            <div className="t">{timeStr}</div>
            <div>{dateStr}</div>
          </div>
          <button className="db-logout" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* BANNER */}
      {tripCount > 0 ? (
        <div className="db-banner warn">
          <AlertTriangle size={16} />
          <div>
            <p className="bt">Overload relay trip detected</p>
            <p className="bd">{tripCount} gate(s) tripped on overload — check local panel before reset</p>
          </div>
        </div>
      ) : (
        <div className="db-banner">
          <CheckCircle2 size={16} />
          <div>
            <p className="bt">System normal</p>
            <p className="bd">All {gates.length} gates loaded · No faults detected</p>
          </div>
        </div>
      )}

      {/* KPI ROW */}
      <div className="db-kpi-row">
        <div className="db-kpi bl">
          <div className="db-kpi-lbl">Total gates</div>
          <div className="db-kpi-val bl">{String(gates.length).padStart(2, "0")}</div>
          <div className="db-kpi-sub">Monitored</div>
        </div>
        <div className="db-kpi gr">
          <div className="db-kpi-lbl">Active</div>
          <div className="db-kpi-val gr">{String(activeCount).padStart(2, "0")}</div>
          <div className="db-kpi-sub">Raising or lowering</div>
        </div>
        <div className="db-kpi am">
          <div className="db-kpi-lbl">Stopped</div>
          <div className="db-kpi-val am">{String(stoppedCount).padStart(2, "0")}</div>
          <div className="db-kpi-sub">At rest</div>
        </div>
        <div className="db-kpi rd">
          <div className="db-kpi-lbl">OLR trips</div>
          <div className={`db-kpi-val ${tripCount > 0 ? "rd" : ""}`}>{String(tripCount).padStart(2, "0")}</div>
          <div className="db-kpi-sub">{tripCount > 0 ? "Requires attention" : "All clear"}</div>
        </div>
      </div>

      {/* SECTION HEAD */}
      <div className="db-sec">
        <h2><Activity size={15} /> Gate status monitoring <span className="sub">— spillway &amp; canal regulators</span></h2>
        <span className="meta">{activeCount} active · {tripCount} trips · {timeStr}</span>
      </div>

      {/* GROUPS */}
      {GROUPS.map((group) => {
        const groupGates = group.ids.map(gateById);
        const groupActive = groupGates.filter((g) => g.status !== "STOP").length;
        const groupTrips = groupGates.filter((g) => g.olrTrip).length;
        return (
          <div className="db-group" key={group.id}>
            <div className="db-group-hd">
              <div className="gh-left">
                <span className="db-group-badge">{group.id}</span>
                <div>
                  <div className="db-group-title">{group.label}</div>
                  <div className="db-group-sub">{group.sub}</div>
                </div>
              </div>
              <div className="db-group-stat">
                <span>Active <b>{groupActive}/{groupGates.length}</b></span>
                <span>Trips <b style={{ color: groupTrips > 0 ? "var(--red)" : "var(--mid)" }}>{groupTrips}</b></span>
              </div>
            </div>

            <div className="db-gate-grid">
              {groupGates.map((gate) => {
                const running = gate.status !== "STOP";
                const raising = gate.status === "RAISING";
                const lowering = gate.status === "LOWERING";
                const fullClose = gate.fullClose;
                const fullOpen = gate.fullOpen;
                let cardClass = "db-card";
                if (gate.olrTrip) cardClass += " tripped";
                else if (running) cardClass += " active";

                return (
                  <div className={cardClass} key={gate.id}>

                    {/* Card header */}
                    <div className="db-card-hd">
                      <div className="db-card-id">
                        Gate <span className="num">#{String(gate.id).padStart(2, "0")}</span>
                      </div>
                      <span className={`db-chip ${gate.status}`}>{gate.status}</span>
                    </div>

                    {/* Prominent status bar */}
                    <div className="db-status-bar">
                      <div>
                        <div className="db-status-label">Gate status</div>
                        <div className="db-status-value" style={{ marginTop: 4 }}>
                          <span className={`db-status-dot ${gate.olrTrip ? "TRIP" : gate.status}`} />
                          <span className={`db-status-text ${gate.olrTrip ? "TRIP" : gate.status}`}>
                            {gate.olrTrip ? "OLR TRIPPED" : gate.status === "RAISING" ? "RAISING" : gate.status === "LOWERING" ? "LOWERING" : "STOPPED"}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="db-status-label">Open position</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--green)", marginTop: 2 }}>
                          {gate.position.toFixed(2)} <span style={{ fontSize: 11, color: "var(--dim)", fontWeight: 500 }}>m</span>
                        </div>
                      </div>
                    </div>

                    {/* Gate visualization */}
                    <div className="db-viz">
                      <GateVisualization gate={gate} />
                    </div>

                    {/* LCD */}
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--bdr)" }}>
                      <div className="db-lcd">
                        <div className="ll">Open Position</div>
                        <div className="lv">{gate.position.toFixed(2)} <small>m</small></div>
                      </div>
                    </div>

                    {/* Flags — "Full open" now lives inside this block with the rest,
                        instead of being rendered outside .db-flags between the flags
                        and the controls row */}
                    <div className="db-flags">
                      <div className="db-flag clickable" onClick={() => toggleFlag(gate.id, "manualMode")}>
                        <span>Manual mode</span>
                        <span className={`db-fval ${gate.manualMode ? "on" : ""}`}>
                          {gate.manualMode ? "ON" : "OFF"}
                          <span className={`db-dot ${gate.manualMode ? "on" : ""}`} />
                        </span>
                      </div>
                      <div className="db-flag clickable" onClick={() => toggleFlag(gate.id, "olrTrip")}>
                        <span>OLR trip</span>
                        <span className={`db-fval ${gate.olrTrip ? "warn" : "on"}`}>
                          {gate.olrTrip ? "TRIPPED" : "OFF"}
                          <span className={`db-dot ${gate.olrTrip ? "warn pulse" : "on"}`} />
                        </span>
                      </div>
                      <div className="db-flag">
                        <span>Gate raising</span>
                        <span className={`db-fval ${raising ? "on" : ""}`}>
                          {raising ? "RAISING" : "STOPPED"}
                          <span className={`db-dot ${raising ? "on pulse" : ""}`} />
                        </span>
                      </div>
                      <div className="db-flag">
                        <span>Gate closing</span>
                        <span className={`db-fval ${lowering ? "on" : ""}`}>
                          {lowering ? "CLOSING" : "STOPPED"}
                          <span className={`db-dot ${lowering ? "on pulse" : ""}`} />
                        </span>
                      </div>
                      <div className="db-flag">
                        <span>Full close</span>
                        <span className={`db-fval ${fullClose ? "on" : ""}`}>
                          {fullClose ? "ON" : "OFF"}
                          <span className={`db-dot ${fullClose ? "on" : ""}`} />
                        </span>
                      </div>
                      <div className="db-flag">
                        <span>Full open</span>
                        <span className={`db-fval ${fullOpen ? "on" : ""}`}>
                          {fullOpen ? "ON" : "OFF"}
                          <span className={`db-dot ${fullOpen ? "on" : ""}`} />
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="db-controls">
                      <button className={`db-btn raise ${raising ? "active" : ""}`} onClick={() => handleRaise(gate.id)}>
                        <ArrowUp size={15} /> Raise
                      </button>
                      <button className={`db-btn stop ${gate.status === "STOP" ? "active" : ""}`} onClick={() => handleStop(gate.id)}>
                        <Square size={15} /> Stop
                      </button>
                      <button className={`db-btn lower ${lowering ? "active" : ""}`} onClick={() => handleLower(gate.id)}>
                        <ArrowDown size={15} /> Lower
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* FOOTER */}
      <footer className="db-footer">
        <span><Waves size={11} style={{ verticalAlign: "-1px", marginRight: 5 }} />Canal Barrage Control System · Operator</span>
        <span>Last updated: {timeStr}</span>
      </footer>
    </div>
  );
}