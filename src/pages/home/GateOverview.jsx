import React from "react";
import { isGateOnline } from "./gateConnectivity";

const GROUPS = [
  { name: "Group 1", description: "Spillway gates 01–02", ids: [1, 2] },
  { name: "Group 2", description: "Spillway gates 03–04", ids: [3, 4] },
  { name: "Group 3", description: "Canal regulator gates 05–06", ids: [5, 6] },
];

/** Shared read-only overview. Uses the existing dashboards' polled PLC data. */
export default function GateOverview({ gates = [], now = Date.now(), onSelectGate }) {
  const timestamp = now instanceof Date ? now.getTime() : now;
  const byId = (id) => gates.find((g) => Number(g.id ?? g.gate) === id);
  const onlineCount = gates.filter((g) => isGateOnline(g.lastUpdate, timestamp)).length;

  return (
    <section className="go-root" aria-label="All gate overview">
      <style>{`
        .go-root { color:#dde6f0; padding:clamp(8px,1.5vw,18px); max-width:1500px; width:100%; margin:0 auto; font-family:Inter,system-ui,sans-serif; }
        .go-root * { box-sizing:border-box; }
        .go-heading { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px; }
        .go-heading h2 { margin:0; font-size:clamp(15px,2vw,22px); font-weight:750; }
        .go-summary { font-size:clamp(10px,1.5vw,12px); color:#91a4bb; white-space:nowrap; }
        .go-groups { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(6px,1vw,14px); }
        .go-group { border:1px solid #243347; border-radius:12px; background:#0c121b; padding:clamp(7px,1vw,13px); min-width:0; }
        .go-group-name { font-size:clamp(11px,1.3vw,14px); font-weight:750; }
        .go-group-sub { color:#8397ae; font-size:clamp(9px,1vw,11px); margin:2px 0 9px; }
        .go-cards { display:grid; grid-template-columns:1fr; gap:8px; }
        .go-card { width:100%; min-width:0; text-align:left; cursor:pointer; color:#dde6f0; background:#111b2a; border:1px solid #2a3b50; border-radius:10px; padding:clamp(9px,1.3vw,15px); font-family:inherit; transition:border-color .15s,background .15s; }
        .go-card:hover,.go-card:focus-visible { border-color:#38b6ff; background:#14243a; outline-offset:2px; }
        .go-top { display:flex; align-items:center; justify-content:space-between; gap:5px; }
        .go-number { font-size:clamp(12px,1.6vw,16px); font-weight:750; white-space:nowrap; }
        .go-online { font-size:clamp(9px,1vw,11px); font-weight:750; white-space:nowrap; }
        .go-reading { margin-top:8px; display:flex; justify-content:space-between; align-items:baseline; gap:5px; }
        .go-percent { font-size:clamp(19px,3vw,32px); font-weight:800; line-height:1; font-variant-numeric:tabular-nums; }
        .go-position { color:#93a7bb; font-size:clamp(9px,1vw,11px); font-variant-numeric:tabular-nums; }
        .go-track { height:5px; border-radius:10px; overflow:hidden; background:#25364a; margin:8px 0; }
        .go-fill { height:100%; background:#38b6ff; border-radius:10px; transition:width .5s ease; }
        .go-bottom { display:flex; justify-content:space-between; align-items:center; gap:5px; font-size:clamp(9px,1vw,11px); color:#a9b8cb; }
        .go-trip { color:#fb6f6f; font-weight:750; }
        .go-help { color:#71879d; font-size:10px; margin:9px 2px 0; }
        @media (max-width:700px) {
          .go-groups { grid-template-columns:1fr; gap:7px; }
          .go-group { padding:7px; }
          .go-group-sub { margin-bottom:5px; }
          .go-cards { grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
          .go-card { padding:8px; }
          .go-reading { margin-top:5px; }
          .go-track { margin:6px 0; }
          .go-percent { font-size:clamp(18px,5vw,25px); }
          .go-online { font-size:9px; }
        }
        @media (max-width:360px) { .go-number { font-size:11px; } .go-online { font-size:8px; } .go-position { font-size:9px; } }
      `}</style>
      <div className="go-heading">
        <h2>Gate Overview</h2>
        <span className="go-summary">{onlineCount} / 6 online · Live PLC data</span>
      </div>
      <div className="go-groups">
        {GROUPS.map((group) => (
          <div className="go-group" key={group.name}>
            <div className="go-group-name">{group.name}</div>
            <div className="go-group-sub">{group.description}</div>
            <div className="go-cards">
              {group.ids.map((id) => {
                const gate = byId(id);
                const online = Boolean(gate && isGateOnline(gate.lastUpdate, timestamp));
                const raw = Number(gate?.position ?? 0);
                const position = Math.min(1000, Math.max(0, Number.isFinite(raw) ? raw : 0));
                const percent = Math.round(position / 10);
                const trip = Boolean(gate?.olrTrip || String(gate?.olr).toUpperCase() === "ON");
                const movement = gate?.status || (gate?.raising === "RAISING" ? "RAISING" : gate?.closing === "CLOSING" ? "LOWERING" : "STOPPED");
                const motion = movement === "STOP" ? "STOPPED" : movement;
                return (
                  <button className="go-card" type="button" key={id} onClick={() => onSelectGate?.(id)} aria-label={`Open Gate ${id} details`}>
                    <div className="go-top">
                      <span className="go-number">Gate {String(id).padStart(2, "0")}</span>
                      <span className="go-online" style={{ color:online ? "#34d399" : "#f87171" }}>● {online ? "ONLINE" : "OFFLINE"}</span>
                    </div>
                    <div className="go-reading">
                      <span className="go-percent">{gate?.lastUpdate == null ? "—" : `${percent}%`}</span>
                      <span className="go-position">{gate?.lastUpdate == null ? "No reading" : `${Math.round(position)} / 1000`}</span>
                    </div>
                    <div className="go-track"><div className="go-fill" style={{ width:`${gate?.lastUpdate == null ? 0 : percent}%` }} /></div>
                    <div className="go-bottom"><span>{gate?.lastUpdate == null ? "NO DATA" : motion}</span><span className={trip ? "go-trip" : ""}>{trip ? "OLR TRIP" : "View ›"}</span></div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="go-help">Tap a gate to open its existing monitoring screen. Status is based on the 30-second telemetry timeout.</p>
    </section>
  );
}
