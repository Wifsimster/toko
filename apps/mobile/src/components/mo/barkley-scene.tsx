import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { barkleySceneLoader, type BarkleySceneSection, type MoScene, type MoState } from "@focusflow/mo/barkley";

import { useTheme, type Palette } from "../../lib/theme";
import { ArtPaths } from "./art";
import { MO_ART, a11yImage, type AppMoState } from "./mo";

const TILE: Record<BarkleySceneSection, keyof Pick<Palette, "surfaceSky" | "surfaceHoney" | "surfacePeach" | "surfaceLavender">> = {
  understand: "surfaceSky",
  technique: "surfaceHoney",
  scenarios: "surfacePeach",
  practice: "surfaceLavender",
};

const isAppState = (state: MoState): state is AppMoState => state in MO_ART;

export function BarkleyScene({ stepNumber, section }: { stepNumber: number; section: BarkleySceneSection }) {
  const c = useTheme();
  const load = barkleySceneLoader(stepNumber, section);
  const key = `${stepNumber}:${section}`;
  const [loaded, setLoaded] = useState<{ key: string; scene: MoScene } | null>(null);

  useEffect(() => {
    if (!load) return;
    let alive = true;
    load().then(
      (scene) => {
        if (alive) setLoaded({ key, scene });
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [load, key]);

  if (!load) return null;
  const scene = loaded?.key === key ? loaded.scene : null;

  return (
    <View
      {...a11yImage(undefined)}
      testID="barkley-scene"
      style={{ borderRadius: 16, backgroundColor: c[TILE[section]], paddingHorizontal: 12, paddingVertical: 10 }}
    >
      <View style={{ width: "100%", maxWidth: 400, alignSelf: "center", aspectRatio: 360 / 200 }}>
        {scene ? (
          <Svg width="100%" height="100%" viewBox={scene.viewBox} pointerEvents="none">
            {scene.layers.map((layer, i) => {
              if (layer.kind === "paths") {
                return (
                  <G key={i}>
                    {layer.paths.map((p, j) => (
                      <Path key={j} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
                    ))}
                  </G>
                );
              }
              if (layer.kind === "mo" && isAppState(layer.state)) {
                return (
                  <G key={i} transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale})`}>
                    <ArtPaths art={MO_ART[layer.state][layer.size]} shadow={layer.shadow} />
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
