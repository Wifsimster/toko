import { View, type StyleProp, type ViewStyle } from "react-native";
import { moodMoArt, type MoodMoState } from "@focusflow/mo/mood";

import { ArtSvg } from "./art";
import { a11yImage } from "./mo";

/**
 * L'humeur du parent (échelle 1 à 5 de `POST /api/parent-mood`) et le Mō qui
 * la montre : même table que le web (`components/mo/parent-mood-faces.ts`) et
 * mêmes libellés (`parentMood.scoreLabel`), pour qu'un score affiche le même
 * Mō partout.
 */
export const PARENT_MOODS: ReadonlyArray<{ score: 1 | 2 | 3 | 4 | 5; state: MoodMoState; label: string }> = [
  { score: 1, state: "fatigue", label: "Épuisé·e" },
  { score: 2, state: "trop-plein", label: "Difficile" },
  { score: 3, state: "inquietude", label: "Moyen" },
  { score: 4, state: "calme", label: "Bien" },
  { score: 5, state: "fierte", label: "Très bien" },
];

/**
 * Un visage de Mō dans un sélecteur d'humeur (accueil, point du soir), en
 * petit (32 à 95 px), immobile. Seul endroit de l'app où Mō montre la
 * fatigue, le trop-plein ou l'inquiétude : le reflet d'un choix du parent,
 * jamais une initiative de l'app, jamais côté enfant. Plusieurs visages par
 * écran sont permis ici seulement (DIRECTION.md). Décoratif : le libellé texte
 * sous le visage porte le sens (et le nom accessible du bouton).
 */
export function MoodFace({ state, size, style }: { state: MoodMoState; size: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View {...a11yImage(undefined)} style={[{ width: size, height: size }, style]}>
      <ArtSvg art={moodMoArt[state]} size={size} />
    </View>
  );
}
