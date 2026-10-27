import { View } from "react-native";

import { sceneTile, type ThemeScene } from "../../lib/mo-themes";
import { useTheme } from "../../lib/theme";
import { Mo, a11yImage } from "./mo";

/** Vignette d'un article ou d'une étape Barkley : 72 px (planche du 2026-10-26 : 64 à 84 px). */
export const SCENE_THUMB_SIZE = 72;

/**
 * La scène de thème d'un article ou d'une étape Barkley, en petit sur une
 * tuile pastel, à gauche du titre. Décorative et immobile : le titre porte
 * l'information. Seule exception à « jamais un Mō par ligne d'une liste »
 * (DESIGN.md) : chaque ligne y gagne un repère visuel, validé avec la
 * planche contact.
 */
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
