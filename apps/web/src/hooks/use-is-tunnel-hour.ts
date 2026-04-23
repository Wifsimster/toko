import { useEffect, useState } from "react";

// Business rule C6: between 16h30 and 21h00 local time, nothing that asks
// the parent to spend money, resubscribe, upgrade, vote, rate or share
// should appear on screen. The tunnel is sacred.
const START_MIN = 16 * 60 + 30; // 16:30
const END_MIN = 21 * 60;        // 21:00

function currentMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function isTunnelHour(now: Date = new Date()): boolean {
  const m = currentMinutes(now);
  return m >= START_MIN && m < END_MIN;
}

// React hook that re-evaluates once a minute so a modal mounted at 16:29
// disappears on its own at 16:30 without reload.
export function useIsTunnelHour(): boolean {
  const [inTunnel, setInTunnel] = useState(() => isTunnelHour());

  useEffect(() => {
    const id = setInterval(() => setInTunnel(isTunnelHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  return inTunnel;
}
