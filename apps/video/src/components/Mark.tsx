import { useCurrentFrame, useVideoConfig } from "remotion";
import { calm } from "../anim";

// Le signe ō : un rond (l'enfant) et un trait (le temps rendu aux parents).
// Même géométrie que brand/toko-mark.svg.
const MACRON = "M28.75 10.75h42.5a4.75 4.75 0 0 1 0 9.5h-42.5a4.75 4.75 0 0 1 0-9.5Z";
const RING =
  "M20 59.25a30 30 0 1 0 60 0a30 30 0 1 0-60 0ZM31.5 59.25a18.5 22 0 1 1 37 0a18.5 22 0 1 1-37 0Z";

export const Mark: React.FC<{ size: number; color: string; delay?: number; animate?: boolean }> = ({
  size,
  color,
  delay = 0,
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = animate ? calm(frame, fps, delay, 30) : 1;
  const macron = animate ? calm(frame, fps, delay + 14, 26) : 1;

  return (
    <svg width={size} height={size} viewBox="10 0 80 100" style={{ overflow: "visible" }}>
      <g style={{ transformOrigin: "50px 59px", transform: `scale(${0.6 + 0.4 * ring})`, opacity: ring }}>
        <path d={RING} fill={color} fillRule="evenodd" />
      </g>
      <g style={{ transformOrigin: "50px 15px", transform: `scaleX(${macron})`, opacity: macron }}>
        <path d={MACRON} fill={color} />
      </g>
    </svg>
  );
};
