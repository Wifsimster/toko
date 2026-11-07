import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { MoArt, MoPath, MoState } from "@focusflow/mo";
import { cn } from "@/lib/utils";
import { useMoArt } from "./use-mo-art";

const INK = "#1E2A2E";
const WHITE = "#FFFFFF";
const MAX_GAZE = 4.5;
const HEART = "M0 3C-1.5 0.5 -5.5 0.5 -5.5 -2.6C-5.5 -4.8 -3 -5.8 0 -3.3C3 -5.8 5.5 -4.8 5.5 -2.6C5.5 0.5 1.5 0.5 0 3Z";

type Box = { x0: number; y0: number; x1: number; y1: number };
type Role = "shadow" | "wave" | "macron" | "eye" | "body";
type Run = { role: Role; start: number; end: number };

function boxOf(d: string): Box {
  const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const xs = n.filter((_, i) => i % 2 === 0);
  const ys = n.filter((_, i) => i % 2 === 1);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

const inside = (a: Box, b: Box) => a.x0 >= b.x0 - 1 && a.y0 >= b.y0 - 1 && a.x1 <= b.x1 + 1 && a.y1 <= b.y1 + 1;

export function eyeIndexes(paths: readonly MoPath[]): number[] {
  const eyes: number[] = [];
  for (let i = 0; i < paths.length - 1; i++) {
    const pupil = paths[i];
    const shine = paths[i + 1];
    if (!pupil || !shine) continue;
    if (pupil.fill !== INK || pupil.part || shine.fill !== WHITE) continue;
    const pb = boxOf(pupil.d);
    if (pb.x1 - pb.x0 > 14 || pb.y1 - pb.y0 > 14) continue;
    if (!inside(boxOf(shine.d), pb)) continue;
    eyes.push(i, i + 1);
    i++;
  }
  return eyes;
}

function runsOf(art: MoArt): { runs: Run[]; eyeCenter: [number, number] | null } {
  const eyes = new Set(eyeIndexes(art.paths));
  const roles: Role[] = art.paths.map((p, i) => (eyes.has(i) ? "eye" : (p.part ?? "body")));
  const runs: Run[] = [];
  roles.forEach((role, i) => {
    const last = runs[runs.length - 1];
    if (last && last.role === role) last.end = i + 1;
    else runs.push({ role, start: i, end: i + 1 });
  });
  const boxes = [...eyes].map((i) => boxOf(art.paths[i]?.d ?? ""));
  const eyeCenter: [number, number] | null = boxes.length
    ? [
        (Math.min(...boxes.map((b) => b.x0)) + Math.max(...boxes.map((b) => b.x1))) / 2,
        (Math.min(...boxes.map((b) => b.y0)) + Math.max(...boxes.map((b) => b.y1))) / 2,
      ]
    : null;
  return { runs, eyeCenter };
}

function Pivot({ at: [x, y], className, children }: { at: readonly [number, number]; className?: string; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <g transform={`translate(${-x} ${-y})`}>{children}</g>
      </g>
    </g>
  );
}

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function InteractiveMo({
  state = "accueil",
  size,
  className,
}: {
  state?: MoState;
  size: number;
  className?: string;
}) {
  const { t } = useTranslation();
  const art = useMoArt(state, "large");
  const svgRef = useRef<SVGSVGElement>(null);
  const [waveKey, setWaveKey] = useState(0);
  const [waving, setWaving] = useState(true);
  const [hop, setHop] = useState(0);
  const [hearts, setHearts] = useState<number[]>([]);
  const [blink, setBlink] = useState(false);
  const [shy, setShy] = useState(false);

  const layout = useMemo(() => (art ? runsOf(art) : null), [art]);

  const look = useCallback(
    (px: number | null, py: number | null) => {
      const svg = svgRef.current;
      const center = layout?.eyeCenter;
      if (!svg || !center || !art) return;
      let dx = 0;
      let dy = 0;
      if (px !== null && py !== null) {
        const [vx = 0, vy = 0, vw = 1, vh = 1] = art.viewBox.split(/\s+/).map(Number);
        const r = svg.getBoundingClientRect();
        const ex = r.left + ((center[0] - vx) / vw) * r.width;
        const ey = r.top + ((center[1] - vy) / vh) * r.height;
        const ox = px - ex;
        const oy = py - ey;
        const dist = Math.hypot(ox, oy);
        if (dist > 0) {
          const reach = Math.min(1, dist / 220) * MAX_GAZE;
          dx = (ox / dist) * reach;
          dy = (oy / dist) * reach * 0.8;
        }
      }
      for (const g of svg.querySelectorAll<SVGGElement>(".mo-gaze")) g.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
    },
    [art, layout],
  );

  useEffect(() => {
    if (!layout?.eyeCenter) return;
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => look(e.clientX, e.clientY));
      clearTimeout(idle);
      idle = setTimeout(() => look(null, null), 4000);
    };
    const onFocus = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLElement) || el.closest("[data-interactive-mo]")) return;
      setShy(el instanceof HTMLInputElement && el.type === "password");
      const r = el.getBoundingClientRect();
      look(r.left + Math.min(r.width, 120), r.top + r.height / 2);
    };
    const onBlur = () => setShy(false);
    const onLeave = () => look(null, null);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [layout, look]);

  useEffect(() => {
    if (reducedMotion()) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        schedule();
      }, 2600 + Math.random() * 3400);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reducedMotion()) return;
    const id = setInterval(() => {
      setWaveKey((k) => k + 1);
      setWaving(true);
    }, 9000);
    return () => clearInterval(id);
  }, []);

  const react = () => {
    setHop((h) => h + 1);
    setWaveKey((k) => k + 1);
    setWaving(true);
    const id = Date.now();
    setHearts((h) => [...h.slice(-4), id]);
    setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1300);
  };

  if (!art || !layout) return <span className={cn("inline-block shrink-0", className)} style={{ width: size, height: size }} aria-hidden="true" />;

  const draw = (start: number, end: number) =>
    art.paths.slice(start, end).map((p, i) => (
      <path key={start + i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
    ));
  const eyePairs = (run: Run) => {
    const out: ReactNode[] = [];
    for (let i = run.start; i < run.end; i += 2) {
      out.push(
        <g key={`eye-${i}`} className="mo-gaze">
          <g className={cn("mo-eye", (blink || shy) && "mo-eye-closed")}>{draw(i, i + 2)}</g>
        </g>,
      );
    }
    return out;
  };

  const ground = art.wave?.ground ?? art.ground ?? [100, 181];
  const shadow = layout.runs.filter((r) => r.role === "shadow");
  const rest = layout.runs.filter((r) => r.role !== "shadow");

  return (
    <span
      data-interactive-mo
      role="img"
      aria-label={t(`mo.label.${state}`)}
      className={cn("inline-block shrink-0 cursor-pointer select-none [-webkit-tap-highlight-color:transparent]", className)}
      style={{ width: size, height: size }}
      onClick={react}
      onAnimationEnd={(e) => {
        if (e.animationName === "mo-wave-hand") setWaving(false);
      }}
    >
      <svg ref={svgRef} viewBox={art.viewBox} width={size} height={size} aria-hidden="true" focusable="false" className="block size-full overflow-visible">
        <g key={`s${hop}`} className={hop ? "mo-hop-shadow" : undefined}>
          {shadow.map((r) => <g key={r.start}>{draw(r.start, r.end)}</g>)}
        </g>
        <Pivot at={ground} className="mo-idle">
          <Pivot at={ground} key={`h${hop}`} className={hop ? "mo-hop" : undefined}>
            {rest.map((run) => {
              if (run.role === "eye") return <g key={run.start}>{eyePairs(run)}</g>;
              if (run.role === "macron") return <g key={run.start} className="mo-macron-float">{draw(run.start, run.end)}</g>;
              if (run.role === "wave" && art.wave) {
                return (
                  <Pivot key={`${run.start}-${waveKey}`} at={art.wave.pivot} className={waving ? "mo-wave-hand" : undefined}>
                    {draw(run.start, run.end)}
                  </Pivot>
                );
              }
              return <g key={run.start}>{draw(run.start, run.end)}</g>;
            })}
          </Pivot>
        </Pivot>
        {hearts.map((id, i) => (
          <g key={id} transform={`translate(${150 + (i % 3) * 14} ${70 - (i % 2) * 10})`}>
            <path className="mo-heart" d={HEART} fill="#F4B9A0" transform="scale(1.6)" />
          </g>
        ))}
      </svg>
    </span>
  );
}
