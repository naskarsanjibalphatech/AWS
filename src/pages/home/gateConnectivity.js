// Shared gate communication logic for Admin, Operator and Remote User.
// The API's "YYYY-MM-DD HH:mm:ss" timestamps are assumed to be IST (UTC+05:30).
// If the backend stores UTC instead, change the offset below to +00:00.
export const GATE_TIMEOUT_MS = 30 * 1000;
export const GATE_READ_APIS = {
  1: "https://7euqgjdoy4.execute-api.ap-south-1.amazonaws.com/default",
  2: "https://3cc84dflq6.execute-api.ap-south-1.amazonaws.com/DEFAULT",
  3: "https://s7p67i8d81.execute-api.ap-south-1.amazonaws.com/default",
  4: "https://91y6dg15lg.execute-api.ap-south-1.amazonaws.com/default",
  5: "https://51f63jt7ka.execute-api.ap-south-1.amazonaws.com/default",
  6: "https://p23r67v6p4.execute-api.ap-south-1.amazonaws.com/default",
};

export function parseGateTimestamp(raw) {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const text = raw.trim();
  const local = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/.exec(text);
  const normalized = local ? `${local[1]}-${local[2]}-${local[3]}T${local[4]}:${local[5]}:${local[6]}${local[7] ? '.' + local[7] : ''}+05:30` : text;
  const time = Date.parse(normalized);
  return Number.isFinite(time) ? time : null;
}

export function latestGateUpdate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const times = Object.values(data).map((item) => parseGateTimestamp(item?.last_update)).filter((v) => v !== null);
  return times.length ? Math.max(...times) : null;
}

export function isGateOnline(lastUpdate, now = Date.now()) {
  return Number.isFinite(lastUpdate) && lastUpdate <= now + 5000 && now - lastUpdate <= GATE_TIMEOUT_MS;
}

// One failed gate request must not interrupt other gates.
export async function fetchGateReadings() {
  return Promise.all(Array.from({ length: 6 }, async (_, i) => {
    const gateId = i + 1;
    try {
      const response = await fetch(GATE_READ_APIS[gateId], { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!json?.data || typeof json.data !== "object") throw new Error("Missing data");
      return { gateId, data: json.data, lastUpdate: latestGateUpdate(json.data) };
    } catch (error) {
      console.warn(`Gate ${gateId} telemetry unavailable:`, error);
      return { gateId, error: true };
    }
  }));
}
