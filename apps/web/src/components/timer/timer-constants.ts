export const DIAL_SIZE = 280; // px
export const STROKE = 22;
export const CENTER = DIAL_SIZE / 2;
export const RADIUS = CENTER - STROKE;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function formatMMSS(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
