import type { ReactNode } from "react";
import Svg, { G, Path } from "react-native-svg";
import type { MoArt, MoGesturePose } from "@focusflow/mo/child";

export type WavePose = { hand: number; body: number };

type ArtProps = {
  art: MoArt;
  shadow?: boolean;
  wave?: WavePose;
  gesture?: MoGesturePose;
};

export function ArtPaths({ art, shadow = true, wave, gesture }: ArtProps) {
  const paths = art.paths.map((p, i) =>
    !shadow && p.part === "shadow" ? null : (
      <Path
        key={i}
        d={p.d}
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth={p.strokeWidth}
        opacity={p.opacity}
      />
    ),
  );
  if (gesture && art.ground) return <GesturePaths art={art} ground={art.ground} paths={paths} pose={gesture} />;
  if (!wave || !art.wave) return <>{paths}</>;

  const parts = art.paths.map((p) => p.part);
  const firstHand = parts.indexOf("wave");
  const rotate = (angle: number, [x, y]: readonly [number, number], children: ReactNode) => (
    <G rotation={angle} originX={x} originY={y}>
      {children}
    </G>
  );
  return (
    <>
      {paths.filter((_, i) => parts[i] === "shadow")}
      {rotate(
        wave.body,
        art.wave.ground,
        <>
          {paths.filter((_, i) => i < firstHand && parts[i] !== "shadow")}
          {rotate(wave.hand, art.wave.pivot, paths.filter((_, i) => parts[i] === "wave"))}
          {paths.filter((_, i) => i > firstHand && parts[i] !== "wave" && parts[i] !== "shadow")}
        </>,
      )}
    </>
  );
}

function GesturePaths({
  art,
  ground: [gx, gy],
  paths,
  pose,
}: {
  art: MoArt;
  ground: readonly [number, number];
  paths: ReactNode[];
  pose: MoGesturePose;
}) {
  const parts = art.paths.map((p) => p.part);
  const firstMacron = parts.indexOf("macron");
  const sy = 1 + pose.stretch;
  const sx = 1 - pose.stretch / 2;
  const body = (i: number) => parts[i] !== "shadow" && parts[i] !== "macron";
  return (
    <>
      <G transform={[pose.shadow, 0, 0, 1, gx * (1 - pose.shadow), 0]}>
        {paths.filter((_, i) => parts[i] === "shadow")}
      </G>
      <G transform={[sx, 0, 0, sy, gx * (1 - sx), gy * (1 - sy) + pose.lift]}>
        {paths.filter((_, i) => body(i) && (firstMacron < 0 || i < firstMacron))}
        <G transform={[1, 0, 0, 1, 0, pose.macron]}>{paths.filter((_, i) => parts[i] === "macron")}</G>
        {firstMacron < 0 ? null : paths.filter((_, i) => body(i) && i > firstMacron)}
      </G>
    </>
  );
}

export function ArtSvg({ art, size, shadow, wave, gesture }: ArtProps & { size: number }) {
  return (
    <Svg width={size} height={size} viewBox={art.viewBox} pointerEvents="none">
      <ArtPaths art={art} shadow={shadow} wave={wave} gesture={gesture} />
    </Svg>
  );
}
