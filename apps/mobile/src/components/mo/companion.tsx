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

/**
 * Un compagnon dessiné (direction « Mō », famille des ronds, sans macron).
 * - `large` : la révélation après l'éclosion (120 à 220 px) ;
 * - `small` : la tuile de la collection (40 à 64 px) ;
 * - `locked` : la silhouette sable avec un « ? », pas encore rencontré.
 * À poser sur une surface crème (`COMPANION_TILE`).
 * Sans `label`, le dessin est caché aux lecteurs d'écran.
 */
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

/** Surface crème sous les compagnons dans la collection. */
export const COMPANION_TILE = { found: "#F3ECE1", locked: "#FBF6EE", lockedBorder: "#D6CCBC" } as const;

/** Un picto enfant (étape de routine, œuf du minuteur), petit sous 96 px. */
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
