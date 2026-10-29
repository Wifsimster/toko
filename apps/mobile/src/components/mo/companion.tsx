import { View, type StyleProp, type ViewStyle } from "react-native";
import {
  companionArt,
  pickMoSize,
  pictoArt,
  type ChildCompanionVariant,
  type CompanionId,
  type PictoName,
} from "@focusflow/mo/child";

import { ArtSvg } from "./art";
import { a11yImage } from "./mo";

export function Companion({
  id,
  variant,
  size,
  label,
  style,
}: {
  id: CompanionId;
  variant: ChildCompanionVariant;
  size: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View {...a11yImage(label)} style={[{ width: size, height: size }, style]}>
      <ArtSvg art={companionArt[id][variant]} size={size} />
    </View>
  );
}

export const COMPANION_TILE = { found: "#F3ECE1", locked: "#FBF6EE", lockedBorder: "#D6CCBC" } as const;

export function Picto({
  name,
  size,
  label,
  style,
}: {
  name: PictoName;
  size: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View {...a11yImage(label)} style={[{ width: size, height: size }, style]}>
      <ArtSvg art={pictoArt[name][pickMoSize(size)]} size={size} />
    </View>
  );
}
