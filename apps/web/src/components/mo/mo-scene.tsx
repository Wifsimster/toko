import { useRef } from "react";
import type { MoIcon, MoPlacement, MoScene as MoSceneData } from "@focusflow/mo";
import { sceneMotionTracks, type SceneMotionTrack } from "@focusflow/mo/motion";
import { cn } from "@/lib/utils";
import { MoPaths } from "./mo";
import { MotionTracks, MovingMoPaths, useSceneMotion } from "./scene-motion";
import { useMoArt } from "./use-mo-art";

export type SceneNote = {
  text: string;
  x: number;
  y: number;
  rotate?: number;
  align?: "left" | "center";
};

function PlacedMo({
  layer,
  breathe,
  wave,
  motion,
}: {
  layer: MoPlacement;
  breathe: boolean;
  wave: boolean;
  motion: readonly SceneMotionTrack[] | undefined;
}) {
  const art = useMoArt(layer.state, layer.size);
  if (!art) return null;
  if (motion && layer.move !== undefined) {
    return (
      <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
        <MovingMoPaths art={art} layer={layer} motion={motion} />
      </g>
    );
  }
  return (
    <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
      <g className={breathe ? "mo-breathe" : undefined}>
        <MoPaths art={art} shadow={layer.shadow} overrides={layer.poseOverrides} wave={wave} />
      </g>
    </g>
  );
}

const INK = "#1E2A2E";
const ink = (fill: string | undefined) => (fill === INK ? "currentColor" : fill);

export function MoScene({
  scene,
  notes = [],
  breathe = false,
  wave = false,
  className,
}: {
  scene: MoSceneData;
  notes?: SceneNote[];
  breathe?: boolean;
  wave?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  useSceneMotion(svgRef, scene.motion);
  const fade = scene.fadeBottom
    ? `linear-gradient(to bottom, #000 ${(1 - scene.fadeBottom / scene.height) * 100}%, transparent)`
    : undefined;

  return (
    <div aria-hidden="true" className={cn("w-full text-foreground", className)}>
      <div
        className="relative w-full [container-type:inline-size]"
        style={{ aspectRatio: `${scene.width} / ${scene.height}` }}
      >
        <svg
          ref={svgRef}
          viewBox={scene.viewBox}
          className="absolute inset-0 size-full overflow-visible"
          focusable="false"
          style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
        >
          {scene.layers.map((layer, i) => {
            if (layer.kind === "mo") {
              return <PlacedMo key={i} layer={layer} breathe={breathe} wave={wave} motion={scene.motion} />;
            }
            if (layer.kind === "text") {
              return (
                <text
                  key={i}
                  x={layer.x}
                  y={layer.y}
                  textAnchor={layer.anchor}
                  fontSize={layer.fontSize}
                  fontWeight={layer.fontWeight}
                  fill={layer.fill}
                  className="font-hand"
                >
                  {layer.text}
                </text>
              );
            }
            return (
              <g key={i}>
                <MotionTracks tracks={sceneMotionTracks(scene.motion, layer.move)}>
                  {layer.paths.map((p, j) => (
                    <path key={j} d={p.d} fill={ink(p.fill)} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
                  ))}
                </MotionTracks>
              </g>
            );
          })}
        </svg>
        {notes.map((note) => (
          <span
            key={note.text}
            className={cn(
              "font-hand absolute whitespace-pre leading-none",
              note.align === "center" && "text-center"
            )}
            style={{
              left: `${(note.x / scene.width) * 100}%`,
              top: `${(note.y / scene.height) * 100}%`,
              fontSize: `${(23 / scene.width) * 100}cqw`,
              transform: note.rotate ? `rotate(${note.rotate}deg)` : undefined,
            }}
          >
            {note.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MoIconArt({ icon, className }: { icon: MoIcon; className?: string }) {
  return (
    <svg viewBox={icon.viewBox} aria-hidden="true" focusable="false" className={cn("block text-foreground", className)}>
      {icon.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={ink(p.fill)}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          opacity={p.opacity}
        />
      ))}
    </svg>
  );
}
