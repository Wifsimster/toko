import type { SceneMotionKey, SceneMotionTrack } from "./types";

export type { SceneMotionKey, SceneMotionTrack } from "./types";

export type SceneMotionPose = {
  x: number;
  y: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
};

export const SCENE_MOTION_REST: SceneMotionPose = { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, opacity: 1 };

export const SCENE_MOTION_EASE_IN_OUT = "cubic-bezier(0.37, 0, 0.63, 1)";

export function sceneMotionPose(key: SceneMotionKey | undefined): SceneMotionPose {
  "worklet";
  return {
    x: key?.x ?? 0,
    y: key?.y ?? 0,
    rotate: key?.rotate ?? 0,
    scaleX: key?.scaleX ?? 1,
    scaleY: key?.scaleY ?? 1,
    opacity: key?.opacity ?? 1,
  };
}

export function sampleSceneMotion(track: SceneMotionTrack, seconds: number): SceneMotionPose {
  "worklet";
  const local = seconds - track.delay;
  if (local <= 0) return sceneMotionPose(track.keys[0]);
  const t = (local % track.duration) / track.duration;
  for (let i = 1; i < track.keys.length; i++) {
    const a = track.keys[i - 1];
    const b = track.keys[i];
    if (a && b && t <= b.at) {
      const k = (t - a.at) / (b.at - a.at);
      const e = track.easing === "linear" ? k : (1 - Math.cos(Math.PI * k)) / 2;
      const pa = sceneMotionPose(a);
      const pb = sceneMotionPose(b);
      return {
        x: pa.x + (pb.x - pa.x) * e,
        y: pa.y + (pb.y - pa.y) * e,
        rotate: pa.rotate + (pb.rotate - pa.rotate) * e,
        scaleX: pa.scaleX + (pb.scaleX - pa.scaleX) * e,
        scaleY: pa.scaleY + (pb.scaleY - pa.scaleY) * e,
        opacity: pa.opacity + (pb.opacity - pa.opacity) * e,
      };
    }
  }
  return sceneMotionPose(track.keys[track.keys.length - 1]);
}

export function sceneMotionMatrix(pose: SceneMotionPose): [number, number, number, number, number, number] {
  "worklet";
  const r = (pose.rotate * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return [pose.scaleX * cos, pose.scaleX * sin, -pose.scaleY * sin, pose.scaleY * cos, pose.x, pose.y];
}

export const sceneMotionTransform = (pose: SceneMotionPose): string =>
  `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg) scale(${pose.scaleX}, ${pose.scaleY})`;

export type SceneMotionKeyframe = { offset: number; easing: string; transform: string; opacity?: number };

export function sceneMotionKeyframes(track: SceneMotionTrack): SceneMotionKeyframe[] {
  const fades = track.keys.some((key) => key.opacity !== undefined);
  const easing = track.easing === "linear" ? "linear" : SCENE_MOTION_EASE_IN_OUT;
  return track.keys.map((key) => {
    const pose = sceneMotionPose(key);
    return {
      offset: key.at,
      easing,
      transform: sceneMotionTransform(pose),
      ...(fades ? { opacity: pose.opacity } : {}),
    };
  });
}

export const sceneMotionTracks = (
  motion: readonly SceneMotionTrack[] | undefined,
  move: string | undefined,
  part?: SceneMotionTrack["part"],
): { track: SceneMotionTrack; index: number }[] =>
  move === undefined || !motion
    ? []
    : motion.flatMap((track, index) => (track.move === move && track.part === part ? [{ track, index }] : []));
