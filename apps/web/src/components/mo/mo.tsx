import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { pickMoSize, type MoArt, type MoPath, type MoState } from "@focusflow/mo";
import { cn } from "@/lib/utils";
import { useMoArt } from "./use-mo-art";

function Pivot({ at: [x, y], className, children }: { at: readonly [number, number]; className: string; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <g transform={`translate(${-x} ${-y})`}>{children}</g>
      </g>
    </g>
  );
}

export function MoPaths({
  art,
  shadow = true,
  overrides,
  wave = false,
  guidedBreath = false,
}: {
  art: MoArt;
  shadow?: boolean;
  overrides?: ReadonlyArray<{ index: number; path: MoPath }>;
  wave?: boolean;
  guidedBreath?: boolean;
}) {
  const paths = art.paths.map((original, i) => {
    const p = overrides?.find((o) => o.index === i)?.path ?? original;
    return !shadow && p.part === "shadow" ? null : (
      <path
        key={i}
        d={p.d}
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth={p.strokeWidth}
        opacity={p.opacity}
      />
    );
  });
  const parts = art.paths.map((p) => p.part);
  const firstMacron = parts.indexOf("macron");
  if (guidedBreath && art.ground && firstMacron >= 0) {
    const body = (i: number) => parts[i] !== "shadow" && parts[i] !== "macron";
    return (
      <>
        {paths.filter((_, i) => parts[i] === "shadow")}
        <Pivot at={art.ground} className="mo-guided-breath-body">
          {paths.filter((_, i) => i < firstMacron && body(i))}
          <g className="mo-guided-breath-macron">{paths.filter((_, i) => parts[i] === "macron")}</g>
          {paths.filter((_, i) => i > firstMacron && body(i))}
        </Pivot>
      </>
    );
  }
  if (!wave || !art.wave) return <>{paths}</>;

  const hand = paths.filter((_, i) => parts[i] === "wave");
  const firstHand = parts.indexOf("wave");
  return (
    <>
      {paths.filter((_, i) => parts[i] === "shadow")}
      <Pivot at={art.wave.ground} className="mo-wave-body">
        {paths.filter((_, i) => i < firstHand && parts[i] !== "shadow")}
        <Pivot at={art.wave.pivot} className="mo-wave-hand">
          {hand}
        </Pivot>
        {paths.filter((_, i) => i > firstHand && parts[i] !== "wave" && parts[i] !== "shadow")}
      </Pivot>
    </>
  );
}

type MoProps = {
  state: MoState;
  size: number;
  label?: string | true;
  breathe?: boolean;
  wave?: boolean;
  guidedBreath?: { startedAt: number };
  shadow?: boolean;
  className?: string;
};

export function Mo({ state, size, label, breathe = false, wave = false, guidedBreath, shadow = true, className }: MoProps) {
  const { t } = useTranslation();
  const art = useMoArt(state, pickMoSize(size));
  const accessibleName = label === true ? t(`mo.label.${state}`) : label;
  const [greeting, setGreeting] = useState({ count: 0, playing: true });
  const canWave = wave && !!art?.wave;
  const svgRef = useRef<SVGSVGElement>(null);
  const breathStartedAt = guidedBreath?.startedAt;
  const hasArt = art !== null;

  useLayoutEffect(() => {
    if (!hasArt || breathStartedAt === undefined) return;
    const elapsed = Math.max(0, performance.now() - breathStartedAt);
    svgRef.current?.style.setProperty("--mo-breath-delay", `${-elapsed}ms`);
  }, [hasArt, breathStartedAt]);

  return (
    <span
      className={cn("inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      data-mo={state}
      onClick={canWave ? () => setGreeting((g) => (g.playing ? g : { count: g.count + 1, playing: true })) : undefined}
      onAnimationEnd={
        canWave
          ? (e) => {
              if (e.animationName === "mo-wave-hand") setGreeting((g) => ({ ...g, playing: false }));
            }
          : undefined
      }
      {...(accessibleName
        ? { role: "img", "aria-label": accessibleName }
        : { "aria-hidden": true })}
    >
      {art && (
        <svg
          ref={svgRef}
          viewBox={art.viewBox}
          width={size}
          height={size}
          aria-hidden="true"
          focusable="false"
          className="block size-full overflow-visible"
        >
          <g className={breathe ? "mo-breathe" : undefined}>
            <MoPaths key={greeting.count} art={art} shadow={shadow} wave={wave} guidedBreath={!!guidedBreath} />
          </g>
        </svg>
      )}
    </span>
  );
}
