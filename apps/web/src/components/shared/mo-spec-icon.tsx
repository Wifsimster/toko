import { moIcons } from "@focusflow/mo/icons";
import type { MoSpec } from "@focusflow/mo/step-icons";
import { Companion, Picto } from "@/components/mo/companion";
import { MoPaths } from "@/components/mo/mo";
import { AnimatedArtSvg } from "@/components/mo/scene-motion";

export function MoSpecIcon({
  spec,
  size,
  label,
  seed,
  className,
}: {
  spec: MoSpec;
  size: number;
  label?: string;
  seed: string;
  className?: string;
}) {
  if (spec.kind === "picto") {
    return <Picto name={spec.name} size={size} label={label} className={className} animate seed={seed} />;
  }
  if (spec.kind === "companion") {
    return <Companion id={spec.name} variant={size < 48 ? "small" : "large"} size={size} label={label} className={className} />;
  }
  const art = moIcons[spec.name];
  return (
    <span
      className={`inline-block shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <AnimatedArtSvg art={art} size={size} seed={seed} animate>
        <MoPaths art={art} />
      </AnimatedArtSvg>
    </span>
  );
}
