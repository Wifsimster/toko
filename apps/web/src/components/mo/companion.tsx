import { useEffect, useRef, useState } from "react";
import {
  loadCompanionArt,
  loadPictoArt,
  pickMoSize,
  type CompanionId,
  type MoArt,
  type PictoName,
} from "@focusflow/mo";
import { cn } from "@/lib/utils";
import { MoPaths } from "./mo";
import { AnimatedArtSvg } from "./scene-motion";

const cache = new Map<string, MoArt>();

function useArt(key: string, load: () => Promise<MoArt>): MoArt | null {
  const [loaded, setLoaded] = useState<{ key: string; art: MoArt } | null>(null);
  const cached = cache.get(key);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (cache.has(key)) return;
    let alive = true;
    loadRef.current().then(
      (art) => {
        cache.set(key, art);
        if (alive) setLoaded({ key, art });
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [key]);

  if (cached) return cached;
  return loaded?.key === key ? loaded.art : null;
}

function ArtFrame({
  art,
  size,
  label,
  className,
  animate = false,
  seed = "",
}: {
  art: MoArt | null;
  size: number;
  label?: string;
  className?: string;
  animate?: boolean;
  seed?: string;
}) {
  return (
    <span
      className={cn("inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {art && (
        <AnimatedArtSvg art={art} size={size} seed={seed} animate={animate}>
          <MoPaths art={art} />
        </AnimatedArtSvg>
      )}
    </span>
  );
}

export function Companion({
  id,
  variant = "large",
  size,
  label,
  className,
}: {
  id: CompanionId;
  variant?: "large" | "small" | "locked";
  size: number;
  label?: string;
  className?: string;
}) {
  const key = `companion:${id}:${variant}`;
  const art = useArt(key, () => loadCompanionArt(id, variant));
  return <ArtFrame art={art} size={size} label={label} className={className} />;
}

export function Picto({
  name,
  size,
  label,
  className,
  animate = false,
  seed,
}: {
  name: PictoName;
  size: number;
  label?: string;
  className?: string;
  animate?: boolean;
  seed?: string;
}) {
  const sizeKey = pickMoSize(size);
  const key = `picto:${name}:${sizeKey}`;
  const art = useArt(key, () => loadPictoArt(name, sizeKey));
  return <ArtFrame art={art} size={size} label={label} className={className} animate={animate} seed={seed ?? name} />;
}
