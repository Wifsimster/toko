import { useEffect, type ReactNode, type RefObject } from "react";
import type { MoArt, MoPath, MoPlacement } from "@focusflow/mo";
import { sceneMotionKeyframes, sceneMotionTracks, type SceneMotionTrack } from "@focusflow/mo/motion";

type IndexedTrack = { track: SceneMotionTrack; index: number };

export function MotionTracks({ tracks, children }: { tracks: readonly IndexedTrack[]; children: ReactNode }) {
  return tracks.reduceRight<ReactNode>((inner, { track, index }) => {
    const [x, y] = track.origin;
    return (
      <g transform={`translate(${x} ${y})`}>
        <g data-motion={index}>
          <g transform={`translate(${-x} ${-y})`}>{inner}</g>
        </g>
      </g>
    );
  }, children);
}

export function MovingMoPaths({
  art,
  layer,
  motion,
}: {
  art: MoArt;
  layer: MoPlacement;
  motion: readonly SceneMotionTrack[];
}) {
  const paths = art.paths.map((original, i) => {
    const p: MoPath = layer.poseOverrides?.find((o) => o.index === i)?.path ?? original;
    return <path key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />;
  });
  const tracks = (part: SceneMotionTrack["part"]) => sceneMotionTracks(motion, layer.move, part);
  const hasShadow = art.paths[0]?.part === "shadow";
  const bodyFrom = hasShadow ? 1 : 0;
  const nested = [tracks("macron"), tracks("hand")].filter((t) => t.length > 0);
  const body: ReactNode[] = [];
  for (let i = bodyFrom; i < paths.length; ) {
    const run = nested.find((t) => t[0]?.track.from === i);
    const end = run?.[0]?.track.to;
    if (run && end !== undefined) {
      body.push(
        <MotionTracks key={`run-${i}`} tracks={run}>
          {paths.slice(i, end)}
        </MotionTracks>,
      );
      i = end;
    } else {
      body.push(paths[i]);
      i++;
    }
  }
  return (
    <>
      {hasShadow && layer.shadow ? <MotionTracks tracks={tracks("shadow")}>{paths[0]}</MotionTracks> : null}
      <MotionTracks tracks={tracks("body")}>{body}</MotionTracks>
    </>
  );
}

export function useSceneMotion(ref: RefObject<SVGSVGElement | null>, motion: readonly SceneMotionTrack[] | undefined) {
  useEffect(() => {
    const svg = ref.current;
    if (!svg || !motion?.length || typeof svg.animate !== "function") return;
    const reduce = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const attached = new Map<Element, Animation>();
    let visible = typeof IntersectionObserver === "undefined";

    const sync = () => {
      if (reduce?.matches) {
        attached.forEach((a) => a.cancel());
        attached.clear();
        return;
      }
      if (!visible && attached.size === 0) return;
      const lead = attached.values().next().value;
      motion.forEach((track, index) => {
        svg.querySelectorAll(`[data-motion="${index}"]`).forEach((el) => {
          if (attached.has(el)) return;
          const animation = el.animate(sceneMotionKeyframes(track), {
            duration: track.duration * 1000,
            delay: track.delay * 1000,
            iterations: Infinity,
            fill: "backwards",
          });
          if (lead?.currentTime != null) animation.currentTime = lead.currentTime;
          attached.set(el, animation);
        });
      });
      attached.forEach((a) => (visible ? a.play() : a.pause()));
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            sync();
          });
    const mutations = new MutationObserver(sync);
    observer?.observe(svg);
    mutations.observe(svg, { childList: true, subtree: true });
    reduce?.addEventListener("change", sync);
    sync();
    return () => {
      observer?.disconnect();
      mutations.disconnect();
      reduce?.removeEventListener("change", sync);
      attached.forEach((a) => a.cancel());
    };
  }, [ref, motion]);
}
