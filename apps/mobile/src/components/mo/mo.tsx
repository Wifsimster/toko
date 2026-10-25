import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, type StyleProp, type ViewStyle } from "react-native";
import {
  childMoArt,
  MO_WAVE_BODY,
  MO_WAVE_DURATION_MS,
  MO_WAVE_HAND,
  moWaveAngle,
  pickMoSize,
  type ChildMoState,
} from "@focusflow/mo/child";

import { mo as copy } from "../../lib/copy";
import { useReduceMotion } from "../../lib/reduce-motion";
import { ArtSvg, type WavePose } from "./art";

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

/**
 * Lance `start` seulement si « Réduire les animations » est inactif. On
 * relit le réglage au lieu de se fier à `useReduceMotion`, qui vaut `false`
 * tant que la réponse du système n'est pas arrivée : sinon Mō bougerait
 * quelques images au premier affichage. Renvoie l'annulation.
 */
function whenMotionAllowed(start: () => () => void): () => void {
  let stop: (() => void) | undefined;
  let alive = true;
  AccessibilityInfo.isReduceMotionEnabled().then(
    (reduced) => {
      if (alive && !reduced) stop = start();
    },
    () => {
      // Réglage illisible : on reste immobile.
    },
  );
  return () => {
    alive = false;
    stop?.();
  };
}

/**
 * Le salut (`MO_WAVE_*`), joué une fois par `run` : les angles de l'image
 * en cours, ou `undefined` au repos (pose statique).
 */
function useWave(enabled: boolean, reduceMotion: boolean, run: number): WavePose | undefined {
  const [pose, setPose] = useState<WavePose | undefined>(undefined);
  useEffect(() => {
    if (!enabled || reduceMotion) return;
    return whenMotionAllowed(() => {
      let frame = 0;
      let start: number | undefined;
      const step = (now: number) => {
        start ??= now;
        const t = (now - start) / MO_WAVE_DURATION_MS;
        if (t >= 1) {
          setPose(undefined);
          return;
        }
        setPose({ hand: moWaveAngle(MO_WAVE_HAND, t), body: moWaveAngle(MO_WAVE_BODY, t) });
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      return () => {
        cancelAnimationFrame(frame);
        setPose(undefined);
      };
    });
  }, [enabled, reduceMotion, run]);
  return enabled && !reduceMotion ? pose : undefined;
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
  /**
   * Mō dit bonjour de la main à l'apparition (1,2 s, état « accueil »), puis
   * ne bouge plus ; toucher Mō rejoue le salut, une fois par toucher. Aucun
   * mouvement avec « Réduire les animations ».
   */
  wave?: boolean;
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
export function Mo({ state, size, label, breathe = false, wave = false, shadow = true, style }: MoProps) {
  const art = childMoArt[state][pickMoSize(size)];
  const reduceMotion = useReduceMotion();
  const breath = useRef(new Animated.Value(0)).current;
  const canWave = wave && !!art.wave;
  const [waveRun, setWaveRun] = useState(0);
  const wavePose = useWave(canWave, reduceMotion, waveRun);

  useEffect(() => {
    if (!breathe || reduceMotion) {
      breath.setValue(0);
      return;
    }
    // Une seule respiration à l'apparition, puis Mō reste immobile : jamais
    // animé en boucle (direction « Mō ») ; à côté du cadran, une animation
    // continue détournerait l'enfant de sa tâche.
    return whenMotionAllowed(() => {
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
    });
  }, [breathe, reduceMotion, breath]);

  const name = label === true ? copy.label[state] : label;
  const drawing = <ArtSvg art={art} size={size} shadow={shadow} wave={wavePose} />;
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
      {canWave ? (
        // Un clin d'œil, pas une action : hors de portée des lecteurs d'écran,
        // et ignoré tant qu'un salut est en cours.
        <Pressable
          accessible={false}
          focusable={false}
          importantForAccessibility="no"
          onPress={() => {
            if (!wavePose) setWaveRun((n) => n + 1);
          }}
        >
          {drawing}
        </Pressable>
      ) : (
        drawing
      )}
    </Animated.View>
  );
}
