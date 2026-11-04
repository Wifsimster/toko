import { View } from "react-native";
import Svg from "react-native-svg";
import { gardenArt } from "@focusflow/mo/garden";

import { ArtPaths } from "../mo/art";
import { a11yImage } from "../mo/mo";

function viewBoxRatio(viewBox: string): number {
  const [, , w, h] = viewBox.split(" ").map(Number);
  return w && h ? h / w : 1;
}

export function GardenPot({ leaves, width, freshLast = false }: { leaves: number; width: number; freshLast?: boolean }) {
  const art = gardenArt(leaves, { freshLast });
  const height = Math.round(width * viewBoxRatio(art.viewBox));
  return (
    <View {...a11yImage(undefined)} style={{ width, height }}>
      <Svg width={width} height={height} viewBox={art.viewBox} pointerEvents="none">
        <ArtPaths art={art} />
      </Svg>
    </View>
  );
}
