import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import type { MoScene, MoState } from "@focusflow/mo/barkley";

import { useTheme, type Palette } from "../../lib/theme";
import { ArtPaths } from "./art";
import { MO_ART, a11yImage, type AppMoState } from "./mo";
import { MotionTracks, MovingMoPaths, useSceneClock } from "./scene-motion";
import { sceneMotionTracks } from "@focusflow/mo/motion";

export type SceneTileColor = keyof Pick<Palette, "surfaceSky" | "surfaceHoney" | "surfacePeach" | "surfaceLavender">;

const isAppState = (state: MoState): state is AppMoState => state in MO_ART;

export function SceneTile({
  load,
  sceneKey,
  tile,
  testID,
  bare,
}: {
  load: (() => Promise<MoScene>) | undefined;
  sceneKey: string;
  tile?: SceneTileColor;
  testID: string;
  bare?: { maxWidth: number };
}) {
  const c = useTheme();
  const ref = useRef<View>(null);
  const [loaded, setLoaded] = useState<{ key: string; scene: MoScene } | null>(null);

  useEffect(() => {
    if (!load) return;
    let alive = true;
    load().then(
      (scene) => {
        if (alive) setLoaded({ key: sceneKey, scene });
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [load, sceneKey]);

  const scene = load && loaded?.key === sceneKey ? loaded.scene : null;
  const clock = useSceneClock(ref, !!scene?.motion?.length);
  if (!load) return null;

  return (
    <View
      ref={ref}
      {...a11yImage(undefined)}
      testID={testID}
      style={
        bare
          ? { width: "100%", maxWidth: bare.maxWidth, alignSelf: "center", aspectRatio: 3 }
          : { borderRadius: 16, backgroundColor: tile ? c[tile] : undefined, paddingHorizontal: 12, paddingVertical: 10 }
      }
    >
      <View
        style={
          bare
            ? { width: "100%", height: "100%" }
            : { width: "100%", maxWidth: 400, alignSelf: "center", aspectRatio: 360 / 200 }
        }
      >
        {scene ? (
          <Svg width="100%" height="100%" viewBox={scene.viewBox} pointerEvents="none">
            {scene.layers.map((layer, i) => {
              if (layer.kind === "paths") {
                return (
                  <G key={i}>
                    <MotionTracks tracks={sceneMotionTracks(scene.motion, layer.move)} clock={clock}>
                      {layer.paths.map((p, j) => (
                        <Path key={j} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
                      ))}
                    </MotionTracks>
                  </G>
                );
              }
              if (layer.kind === "mo" && isAppState(layer.state)) {
                const art = MO_ART[layer.state][layer.size];
                return (
                  <G key={i} transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
                    {scene.motion && layer.move !== undefined ? (
                      <MovingMoPaths art={art} layer={layer} motion={scene.motion} clock={clock} />
                    ) : (
                      <ArtPaths art={art} shadow={layer.shadow} />
                    )}
                  </G>
                );
              }
              return null;
            })}
          </Svg>
        ) : null}
      </View>
    </View>
  );
}
