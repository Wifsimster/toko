import { View, type StyleProp, type ViewStyle } from "react-native";
import { moodMoArt, type MoodMoState } from "@focusflow/mo/mood";

import { ArtSvg } from "./art";
import { a11yImage } from "./mo";

export const PARENT_MOODS: ReadonlyArray<{ score: 1 | 2 | 3 | 4 | 5; state: MoodMoState; label: string }> = [
  { score: 1, state: "fatigue", label: "Épuisé·e" },
  { score: 2, state: "trop-plein", label: "Difficile" },
  { score: 3, state: "inquietude", label: "Moyen" },
  { score: 4, state: "calme", label: "Bien" },
  { score: 5, state: "fierte", label: "Très bien" },
];

export function MoodFace({ state, size, style }: { state: MoodMoState; size: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View {...a11yImage(undefined)} style={[{ width: size, height: size }, style]}>
      <ArtSvg art={moodMoArt[state]} size={size} />
    </View>
  );
}
