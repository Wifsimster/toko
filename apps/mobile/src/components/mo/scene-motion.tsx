import { useContext, useEffect, useState, type ReactNode, type RefObject } from "react";
import { AppState, Dimensions, Platform, type View } from "react-native";
import { G, Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { NavigationContext } from "@react-navigation/native";
import type { MoPlacement } from "@focusflow/mo/barkley";
import type { MoArt } from "@focusflow/mo/child";
import {
  sampleSceneMotion,
  sceneMotionMatrix,
  sceneMotionTracks,
  type SceneMotionTrack,
} from "@focusflow/mo/motion";

import { useReduceMotion } from "../../lib/reduce-motion";

const AnimatedG = Animated.createAnimatedComponent(G);
const MATRIX_PROP = Platform.OS === "web" ? "transform" : "matrix";

type IndexedTrack = { track: SceneMotionTrack; index: number };

function MotionTrack({ track, clock, children }: { track: SceneMotionTrack; clock: SharedValue<number>; children: ReactNode }) {
  const animatedProps = useAnimatedProps(() => {
    const pose = sampleSceneMotion(track, clock.value);
    return { [MATRIX_PROP]: sceneMotionMatrix(pose), opacity: pose.opacity };
  }, [track]);
  const [x, y] = track.origin;
  return (
    <G transform={`translate(${x} ${y})`}>
      <AnimatedG animatedProps={animatedProps}>
        <G transform={`translate(${-x} ${-y})`}>{children}</G>
      </AnimatedG>
    </G>
  );
}

export function MotionTracks({
  tracks,
  clock,
  children,
}: {
  tracks: readonly IndexedTrack[];
  clock: SharedValue<number>;
  children: ReactNode;
}) {
  return tracks.reduceRight<ReactNode>(
    (inner, { track, index }) => (
      <MotionTrack key={index} track={track} clock={clock}>
        {inner}
      </MotionTrack>
    ),
    children,
  );
}

export function MovingMoPaths({
  art,
  layer,
  motion,
  clock,
}: {
  art: MoArt;
  layer: MoPlacement;
  motion: readonly SceneMotionTrack[];
  clock: SharedValue<number>;
}) {
  const paths = art.paths.map((original, i) => {
    const p = layer.poseOverrides?.find((o) => o.index === i)?.path ?? original;
    return <Path key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />;
  });
  const tracks = (part: SceneMotionTrack["part"]) => sceneMotionTracks(motion, layer.move, part);
  const hasShadow = art.paths[0]?.part === "shadow";
  const nested = [tracks("macron"), tracks("hand")].filter((t) => t.length > 0);
  const body: ReactNode[] = [];
  for (let i = hasShadow ? 1 : 0; i < paths.length; ) {
    const run = nested.find((t) => t[0]?.track.from === i);
    const end = run?.[0]?.track.to;
    if (run && end !== undefined) {
      body.push(
        <MotionTracks key={`run-${i}`} tracks={run} clock={clock}>
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
      {hasShadow && layer.shadow ? (
        <MotionTracks tracks={tracks("shadow")} clock={clock}>
          {paths[0]}
        </MotionTracks>
      ) : null}
      <MotionTracks tracks={tracks("body")} clock={clock}>
        {body}
      </MotionTracks>
    </>
  );
}

function useScreenFocused(): boolean {
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState(() => navigation?.isFocused() ?? true);
  useEffect(() => {
    if (!navigation) return;
    setFocused(navigation.isFocused());
    const offFocus = navigation.addListener("focus", () => setFocused(true));
    const offBlur = navigation.addListener("blur", () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);
  return focused;
}

function useOnScreen(ref: RefObject<View | null>, enabled: boolean): boolean {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setOnScreen(false);
      return;
    }
    const check = () => {
      if (AppState.currentState !== "active") {
        setOnScreen(false);
        return;
      }
      ref.current?.measureInWindow((x, y, width, height) => {
        const screen = Dimensions.get("window");
        setOnScreen(
          AppState.currentState === "active" &&
            width > 0 &&
            height > 0 &&
            y < screen.height &&
            y + height > 0 &&
            x < screen.width &&
            x + width > 0,
        );
      });
    };
    check();
    const timer = setInterval(check, 500);
    const sub = AppState.addEventListener("change", (state) => (state === "active" ? check() : setOnScreen(false)));
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [ref, enabled]);
  return onScreen;
}

export function useSceneClock(ref: RefObject<View | null>, animated: boolean): SharedValue<number> {
  const clock = useSharedValue(0);
  const reduceMotion = useReduceMotion();
  const focused = useScreenFocused();
  const onScreen = useOnScreen(ref, animated && !reduceMotion && focused);
  const frame = useFrameCallback((info) => {
    clock.value += (info.timeSincePreviousFrame ?? 0) / 1000;
  }, false);
  const running = animated && !reduceMotion && focused && onScreen;
  useEffect(() => {
    frame.setActive(running);
  }, [frame, running]);
  useEffect(() => {
    if (reduceMotion) clock.value = 0;
  }, [clock, reduceMotion]);
  return clock;
}
