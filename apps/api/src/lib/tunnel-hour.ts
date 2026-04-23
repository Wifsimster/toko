// Business rule B4: server-side counterpart of `useIsTunnelHour`.
// Any push fanout that is not flagged `priority: 'critical'` must be
// blocked if the recipient's local time is within the tunnel.
const START_MIN = 16 * 60 + 30; // 16h30
const END_MIN = 21 * 60;        // 21h00

export function isTunnelHourIn(timezone: string, now: Date = new Date()): boolean {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    const total = h * 60 + m;
    return total >= START_MIN && total < END_MIN;
  } catch {
    return false;
  }
}
