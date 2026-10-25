import { useEffect, useRef } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";
import { childMoArt, pickMoSize, type ChildMoState } from "@focusflow/mo/child";

import { mo as copy } from "../../lib/copy";
import { useReduceMotion } from "../../lib/reduce-motion";
import { ArtSvg } from "./art";

/** Props d'accessibilité : une image nommée, ou rien pour les lecteurs d'écran. */
export function a11yImage(label: string | undefined) {
  return label
    ? ({ accessible: true, accessibilityRole: "image", accessibilityLabel: label } as const)
    : ({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: "no-hide-descendants",
      } as const);
}

type MoProps = {
  /** Côté enfant, seulement des états positifs ou neutres (voir `CHILD_MO_STATES`). */
  state: ChildMoState;
  /** Côté en pixels. Sous 96 px, la version petite (trait plus épais) est choisie seule. */
  size: number;
  /**
   * Par défaut Mō est décoratif (caché aux lecteurs d'écran). Avec `label`,
   * Mō devient une image : `true` pour le libellé français de l'état, ou un texte.
   */
  label?: string | true;
  /**
   * Une respiration douce (4 s) à l'apparition, jamais en boucle ; aucune
   * avec « Réduire les animations ».
   */
  breathe?: boolean;
  /** Ombre portée au sol. */
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Mō, la mascotte de Tokō, côté enfant (guide, veille, bravo…), en clair
 * seulement : l'app n'a pas de mode sombre. Règles d'usage :
 * DESIGN.md et la direction « Mō » (un seul Mō par écran, jamais d'état
 * négatif devant l'enfant).
 */
export function Mo({ state, size, label, breathe = false, shadow = true, style }: MoProps) {
  const art = childMoArt[state][pickMoSize(size)];
  const reduceMotion = useReduceMotion();
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!breathe || reduceMotion) {
      breath.setValue(0);
      return;
    }
    // Une seule respiration à l'apparition, puis Mō reste immobile : jamais
    // animé en boucle (direction « Mō ») ; à côté du cadran, une animation
    // continue détournerait l'enfant de sa tâche.
    const half = { duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
    const once = Animated.sequence([
      Animated.timing(breath, { toValue: 1, ...half }),
      Animated.timing(breath, { toValue: 0, ...half }),
    ]);
    once.start();
    return () => {
      once.stop();
      breath.setValue(0);
    };
  }, [breathe, reduceMotion, breath]);

  const name = label === true ? copy.label[state] : label;
  return (
    <Animated.View
      {...a11yImage(name)}
      style={[
        {
          width: size,
          height: size,
          // Mō respire depuis le sol, comme sur le web (`.mo-breathe`).
          transformOrigin: "50% 100%",
          transform: [
            { scaleX: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) },
            { scaleY: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
          ],
        },
        style,
      ]}
    >
      <ArtSvg art={art} size={size} shadow={shadow} />
    </Animated.View>
  );
}
