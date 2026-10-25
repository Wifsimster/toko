import type { MoIcon, MoPlacement, MoScene as MoSceneData } from "@focusflow/mo";
import { cn } from "@/lib/utils";
import { MoPaths } from "./mo";
import { useMoArt } from "./use-mo-art";

/**
 * Note manuscrite posée sur une scène. Décor seulement (Caveat) : elle ne
 * porte jamais d'information, elle est donc masquée aux lecteurs d'écran.
 * Coordonnées dans le repère de la scène (unités de sa viewBox).
 */
export type SceneNote = {
  text: string;
  x: number;
  y: number;
  rotate?: number;
  align?: "left" | "center";
};

function PlacedMo({ layer, breathe }: { layer: MoPlacement; breathe: boolean }) {
  const art = useMoArt(layer.state, layer.size);
  if (!art) return null;
  return (
    <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
      <g className={breathe ? "mo-breathe" : undefined}>
        <MoPaths art={art} shadow={layer.shadow} />
      </g>
    </g>
  );
}

/**
 * Fond crème posé sous une illustration en mode sombre. Les dessins de la
 * direction sont faits pour le crème (trait encre, sols beige) : sur le fond
 * Graphite, les traits disparaissaient. En attendant la version sombre de
 * Mō et des décors, l'illustration garde son papier crème.
 */
export const MO_DARK_PLATE = "dark:rounded-[28px] dark:bg-[#FBF6EE]";

/** Une scène de la direction « Mō » (décor + Mō), qui suit la largeur de son parent. */
export function MoScene({
  scene,
  notes = [],
  breathe = false,
  plate = true,
  className,
}: {
  scene: MoSceneData;
  notes?: SceneNote[];
  breathe?: boolean;
  /** `false` quand un parent porte déjà le fond crème sombre (MO_DARK_PLATE). */
  plate?: boolean;
  className?: string;
}) {
  const fade = scene.fadeBottom
    ? `linear-gradient(to bottom, #000 ${(1 - scene.fadeBottom / scene.height) * 100}%, transparent)`
    : undefined;

  // Une note posée au-dessus de la scène (y < 0) doit rester sur le papier
  // crème en sombre : le fond crème s'agrandit d'autant vers le haut.
  const noteRoom = Math.max(0, ...notes.map((n) => -n.y + 8));

  return (
    <div
      aria-hidden="true"
      className={cn("w-full", plate && MO_DARK_PLATE, plate && noteRoom > 0 && "dark:pt-(--mo-note-room)", className)}
      style={
        noteRoom > 0
          ? ({ "--mo-note-room": `${(noteRoom / scene.width) * 100}%` } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className="relative w-full [container-type:inline-size]"
        style={{ aspectRatio: `${scene.width} / ${scene.height}` }}
      >
        <svg
          viewBox={scene.viewBox}
          className="absolute inset-0 size-full overflow-visible"
          focusable="false"
          style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
        >
          {scene.layers.map((layer, i) => {
            if (layer.kind === "mo") return <PlacedMo key={i} layer={layer} breathe={breathe} />;
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
                {layer.paths.map((p, j) => (
                  <path key={j} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
                ))}
              </g>
            );
          })}
        </svg>
        {notes.map((note) => (
          <span
            key={note.text}
            className={cn(
              // Encre dans les deux thèmes : la note est posée sur le papier crème.
              "font-hand absolute whitespace-pre leading-none text-[#1E2A2E]",
              note.align === "center" && "text-center"
            )}
            style={{
              left: `${(note.x / scene.width) * 100}%`,
              top: `${(note.y / scene.height) * 100}%`,
              // Même taille que la maquette (23 px pour 390 px de large), à l'échelle de la scène.
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

const INK = "#1E2A2E";

/**
 * Pictogramme dessiné de la direction (objectifs, accueil). Décoratif.
 * `inkFollowsText` : le trait encre prend la couleur du texte (crème en
 * sombre), pour un pictogramme fait seulement de traits.
 */
export function MoIconArt({
  icon,
  inkFollowsText = false,
  className,
}: {
  icon: MoIcon;
  inkFollowsText?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox={icon.viewBox} aria-hidden="true" focusable="false" className={cn("block", className)}>
      {icon.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={inkFollowsText && p.fill === INK ? "currentColor" : p.fill}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          opacity={p.opacity}
        />
      ))}
    </svg>
  );
}
