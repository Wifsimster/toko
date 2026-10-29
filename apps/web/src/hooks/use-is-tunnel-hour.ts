import { useEffect, useState } from "react";

const START_MIN = 16 * 60 + 30;
const END_MIN = 21 * 60;

function currentMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function isTunnelHour(now: Date = new Date()): boolean {
  const m = currentMinutes(now);
  return m >= START_MIN && m < END_MIN;
}

export function useIsTunnelHour(): boolean {
  const [inTunnel, setInTunnel] = useState(() => isTunnelHour());

  useEffect(() => {
    const id = setInterval(() => setInTunnel(isTunnelHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  return inTunnel;
}
