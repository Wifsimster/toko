import { useEffect, useState } from "react";
import { LazyMotion, m, AnimatePresence, domAnimation } from "motion/react";

const PARTICLE_COUNT = 32;
const COLORS = [
  "#a37e29", // accent-500 (honey)
  "#5a815a", // sage-500
  "#3b82f6", // info blue
  "#f59e0b", // warning amber
  "#10b981", // success green
];

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
  rotate: number;
}

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: Math.random() * Math.PI * 2,
    distance: 120 + Math.random() * 200,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.15,
    rotate: Math.random() * 360,
  }));
}

// Single-shot confetti burst centered on the viewport. Mount it once per
// celebration (give it a changing `key` to replay) — the burst plays on
// mount and hides itself after the animation finishes (~1.5s). Safe to
// mount even when the user prefers reduced motion: motion respects the OS
// setting and we keep particle count low.
export function BadgeCelebration() {
  const [active, setActive] = useState(true);
  const [particles] = useState<Particle[]>(buildParticles);

  useEffect(() => {
    const id = setTimeout(() => setActive(false), 1600);
    return () => clearTimeout(id);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {active && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
          >
            {particles.map((p) => {
              const x = Math.cos(p.angle) * p.distance;
              const y = Math.sin(p.angle) * p.distance;
              return (
                <m.span
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{
                    x,
                    y,
                    opacity: [0, 1, 1, 0],
                    scale: [0.4, 1, 1, 0.6],
                    rotate: p.rotate,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.4,
                    delay: p.delay,
                    ease: "easeOut",
                    times: [0, 0.1, 0.6, 1],
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
