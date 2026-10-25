import type { MoIcon, MoPlacement, MoScene as MoSceneData, MoTheme } from "@focusflow/mo";
import { SCENE_DARK_FILLS } from "@focusflow/mo/scenes";
import { cn } from "@/lib/utils";
import { MoPaths } from "./mo";
import { useMoArt, useMoTheme } from "./use-mo-art";

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
  const theme = useMoTheme();
  const art = useMoArt(layer.state, layer.size);
  if (!art) return null;
  return (
    <g transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
      <g className={breathe ? "mo-breathe" : undefined}>
        {/* La variante de pose de la scène ne vaut que pour le dessin clair :
            la version sombre a son propre écart au macron (liseré). */}
        <MoPaths art={art} shadow={layer.shadow} overrides={theme === "light" ? layer.lightOverrides : undefined} />
      </g>
    </g>
  );
}

const INK = "#1E2A2E";
/** Trait encre du décor : suit la couleur du texte (encre en clair, crème en sombre). */
const ink = (fill: string | undefined) => (fill === INK ? "currentColor" : fill);
/** Couleur d'un aplat de décor : encre qui suit le texte, environnement assombri en sombre. */
const decorFill = (fill: string | undefined, theme: MoTheme) =>
  theme === "dark" && fill && SCENE_DARK_FILLS[fill] ? SCENE_DARK_FILLS[fill] : ink(fill);

/** Une scène de la direction « Mō » (décor + Mō), qui suit la largeur de son parent. */
export function MoScene({
  scene,
  notes = [],
  breathe = false,
  className,
}: {
  scene: MoSceneData;
  notes?: SceneNote[];
  breathe?: boolean;
  className?: string;
}) {
  const theme = useMoTheme();
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
                  <path key={j} d={p.d} fill={decorFill(p.fill, theme)} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
                ))}
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

/** Pictogramme dessiné de la direction (objectifs, accueil). Décoratif ; trait encre en crème en sombre. */
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
