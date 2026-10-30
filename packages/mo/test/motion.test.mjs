import { describe, expect, it } from "vitest";
import { build, sceneMotion } from "../scripts/generate.mjs";
import { sampleSceneMotion, sceneMotionKeyframes, sceneMotionMatrix, sceneMotionTracks } from "../src/motion.ts";

const box = { kind: "paths", move: "boite", paths: [{ d: "M10 10L30 10L30 40L10 40Z", fill: "#FFFFFF" }] };
const scene = { width: 360, height: 200, viewBox: "0 0 360 200", layers: [box] };
const keys = (peak) => [{ at: 0 }, { at: 0.5, ...peak }, { at: 1 }];
const motion = (tracks) => sceneMotion(scene, { tracks }, [], "test");

describe("scene motion spec", () => {
  it("resolves a track on a marked group, origin at the centre by default", () => {
    const [track] = motion([{ target: "boite", duration: 4, keys: keys({ y: -3 }) }]);
    expect(track).toEqual({
      move: "boite",
      origin: [20, 25],
      duration: 4,
      delay: 0,
      easing: "ease-in-out",
      keys: [{ at: 0 }, { at: 0.5, y: -3 }, { at: 1 }],
    });
  });

  it("reads origin keywords on the group frame and expands scale", () => {
    const [track] = motion([{ target: "boite", duration: 4, origin: ["center", "bottom"], keys: keys({ scale: 1.05 }) }]);
    expect(track.origin).toEqual([20, 40]);
    expect(track.keys[1]).toEqual({ at: 0.5, scaleX: 1.05, scaleY: 1.05 });
  });

  it.each([
    [[{ target: "ailleurs", duration: 4, keys: keys({ y: 2 }) }], /introuvable/],
    [[{ target: "boite", duration: 1, keys: keys({ y: 2 }) }], /duration/],
    [[{ target: "boite", duration: 8, keys: keys({ y: 2 }) }], /duration/],
    [[{ target: "boite", duration: 4, delay: 4, keys: keys({ y: 2 }) }], /delay/],
    [[{ target: "boite", duration: 4, keys: keys({ y: 20 }) }], /hors de/],
    [[{ target: "boite", duration: 4, keys: keys({ opacity: 0 }) }], /hors de/],
    [[{ target: "boite", duration: 2, keys: [{ at: 0 }, { at: 0.1, rotate: 10 }, { at: 1 }] }], /trop vite/],
    [[{ target: "boite", duration: 4, keys: [{ at: 0, y: 2 }, { at: 1 }] }], /au repos/],
    [[{ target: "boite", duration: 4, keys: [{ at: 0 }, { at: 0.5, y: 2 }] }], /at 1/],
    [[{ target: "boite", duration: 4, keys: [{ at: 0 }, { at: 0.6, y: 2 }, { at: 0.4 }, { at: 1 }] }], /croissant/],
    [[{ target: "boite", duration: 4, keys: keys({ blur: 2 }) }], /inconnue/],
    [[{ target: "boite.macron", duration: 4, keys: keys({ y: 2 }) }], /seul un Mō/],
  ])("rejects %j", (tracks, error) => {
    expect(() => motion(tracks)).toThrow(error);
  });

  it("rejects a marked group without a track", () => {
    expect(() => sceneMotion({ ...scene, layers: [box, { ...box, move: "autre" }] }, { tracks: [{ target: "boite", duration: 4, keys: keys({ y: 2 }) }] }, [], "test")).toThrow(/sans piste/);
  });

  it("splits Mō into body and macron runs in art units", () => {
    const files = build();
    const source = files.get("barkley/etape-1-technique.ts");
    const scene = JSON.parse(source.slice(source.indexOf("= {") + 2, source.lastIndexOf(";")));
    const mo = scene.layers.find((l) => l.kind === "mo");
    const body = scene.motion.find((t) => t.move === "mo" && t.part === "body");
    const macron = scene.motion.find((t) => t.part === "macron");
    expect(mo.move).toBe("mo");
    expect(body.from).toBe(1);
    expect(macron.from).toBeGreaterThan(body.from);
    expect(macron.to).toBeLessThanOrEqual(body.to);
    expect(macron.keys[1].y).toBeCloseTo(-1 / mo.scale, 1);
  });
});

describe("scene motion sampling", () => {
  const track = { move: "boite", origin: [0, 0], duration: 4, delay: 1, easing: "ease-in-out", keys: keys({ y: -4, opacity: 0.5 }) };

  it("rests before its delay and at each loop boundary", () => {
    expect(sampleSceneMotion(track, 0.5)).toEqual({ x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, opacity: 1 });
    expect(sampleSceneMotion(track, 1).y).toBe(0);
    expect(sampleSceneMotion(track, 5).y).toBeCloseTo(0);
  });

  it("eases in and out between keys and loops", () => {
    expect(sampleSceneMotion(track, 3).y).toBeCloseTo(-4);
    expect(sampleSceneMotion(track, 2).y).toBeCloseTo(-2);
    expect(sampleSceneMotion(track, 1.5).y).toBeGreaterThan(-2);
    expect(sampleSceneMotion(track, 7).y).toBeCloseTo(-4);
  });

  it("builds the same pose as a matrix and as web keyframes", () => {
    expect(sceneMotionMatrix({ x: 2, y: 3, rotate: 90, scaleX: 1, scaleY: 1, opacity: 1 }).map((v) => Math.round(v * 1000) / 1000)).toEqual([0, 1, -1, 0, 2, 3]);
    expect(sceneMotionKeyframes(track)[1]).toEqual({
      offset: 0.5,
      easing: "cubic-bezier(0.37, 0, 0.63, 1)",
      transform: "translate(0px, -4px) rotate(0deg) scale(1, 1)",
      opacity: 0.5,
    });
  });

  it("finds the tracks of a target and part", () => {
    const tracks = [track, { ...track, move: "mo", part: "body" }, { ...track, move: "mo", part: "macron" }];
    expect(sceneMotionTracks(tracks, "boite").map((t) => t.index)).toEqual([0]);
    expect(sceneMotionTracks(tracks, "mo", "macron").map((t) => t.index)).toEqual([2]);
    expect(sceneMotionTracks(tracks, undefined)).toEqual([]);
  });
});
