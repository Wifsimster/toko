import { m as motion } from "motion/react";

// Le chemin des 10 étapes, dessiné d'après la progression réelle : le tracé
// se remplit jusqu'à l'étape en cours, qui respire doucement. Décoratif (le
// texte à côté dit la même chose) : aria-hidden. Les animations passent par
// le MotionConfig de la page (reducedMotion="user").
const W = 320;
const H = 120;
const POINTS = Array.from({ length: 10 }, (_, i) => ({
  x: 20 + i * 31.1,
  y: 74 - i * 4.2 + 12 * Math.sin(i * 0.9),
}));
const D = POINTS.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

function starPath(cx: number, cy: number, r: number) {
  return (
    Array.from({ length: 10 }, (_, k) => {
      const rr = k % 2 ? r * 0.45 : r;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      return `${k ? "L" : "M"} ${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }).join(" ") + " Z"
  );
}

export function ProgramPath({
  completed,
  current,
}: {
  /** Numéros des étapes validées. */
  completed: ReadonlySet<number>;
  /** Étape en cours (1-10), null quand tout est validé. */
  current: number | null;
}) {
  const done = current === null;
  // Part du tracé à dessiner : jusqu'au nœud en cours (ou jusqu'au bout).
  const reach = done ? 1 : (current - 1) / 9;
  const last = POINTS[9]!;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" aria-hidden="true">
      <path d={D} fill="none" className="stroke-muted-foreground/20" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <motion.path
        d={D}
        fill="none"
        className="stroke-primary"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: reach }}
        transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 }}
      />
      {POINTS.map((p, i) => {
        const n = i + 1;
        const isDone = completed.has(n);
        const isCurrent = n === current;
        const at = 0.2 + 1.1 * (i / 9);
        if (n === 10 && done) {
          return (
            <motion.path
              key={n}
              d={starPath(last.x, last.y, 12)}
              className="fill-honey-foreground"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.3, type: "spring", stiffness: 260, damping: 14 }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          );
        }
        return (
          <g key={n}>
            {isCurrent && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={9}
                className="fill-honey-border"
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: [1, 1.9, 1], opacity: [0.9, 0, 0.9] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={isCurrent ? 8 : 6.5}
              strokeWidth={isCurrent ? 2.5 : 1.5}
              className={
                isCurrent
                  ? "fill-background stroke-honey-foreground"
                  : "fill-background stroke-muted-foreground/35"
              }
            />
            {isDone && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={6.5}
                className="fill-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: at, type: "spring", stiffness: 320, damping: 18 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            )}
            {isCurrent && (
              <circle cx={p.x} cy={p.y} r={3} className="fill-honey-foreground" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
