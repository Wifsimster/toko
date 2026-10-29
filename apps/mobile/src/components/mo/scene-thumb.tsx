import { View } from "react-native";

import { sceneTile, type ThemeScene } from "../../lib/mo-themes";
import { useTheme } from "../../lib/theme";
import { Mo, a11yImage } from "./mo";

export const SCENE_THUMB_SIZE = 72;

export function SceneThumb({ scene, size = SCENE_THUMB_SIZE }: { scene: ThemeScene; size?: number }) {
  const c = useTheme();
  return (
    <View
      {...a11yImage(undefined)}
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        backgroundColor: sceneTile(scene, c),
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Mo state={scene} size={size - 8} shadow={false} />
    </View>
  );
}
