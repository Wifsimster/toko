import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, type StyleProp, type ViewStyle } from "react-native";
import {
  childMoArt,
  MO_GESTURES,
  MO_WAVE_BODY,
  MO_WAVE_DURATION_MS,
  MO_WAVE_HAND,
  moGesturePose,
  moWaveAngle,
  pickMoSize,
  type ChildMoState,
  type MoArt,
  type MoGestureName,
  type MoSize,
} from "@focusflow/mo/child";
import { parentMoArt, type ParentMoState } from "@focusflow/mo/parent";

import { mo as copy } from "../../lib/copy";
import { useReduceMotion } from "../../lib/reduce-motion";
import { ArtSvg, type WavePose } from "./art";

/**
 * Un état de Mō dans l'app : ceux de l'enfant (`ChildMoState`) et ceux du
 * parent (`ParentMoState`, entrée `@focusflow/mo/parent`). Jamais un état de
 * reflet (fatigue, trop-plein, inquiétude). Les écrans et composants côté
 * enfant (`MoSays`) gardent le type `ChildMoState`.
 */
export type AppMoState = ChildMoState | ParentMoState;

// Les deux entrées partagent les mêmes modules pour accueil, bravo, calme et guide.
const MO_ART: Record<AppMoState, Record<MoSize, MoArt>> = { ...childMoArt, ...parentMoArt };

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
 * Un mouvement de `durationMs` (salut ou geste), joué une fois par `run` :
 * l'avancement de l'image en cours (0 à 1), ou `undefined` au repos (pose
 * statique).
 */
function usePlayOnce(durationMs: number, enabled: boolean, reduceMotion: boolean, run: number): number | undefined {
  const [progress, setProgress] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!enabled || reduceMotion) return;
    return whenMotionAllowed(() => {
      let frame = 0;
      let start: number | undefined;
      const step = (now: number) => {
        start ??= now;
        const t = (now - start) / durationMs;
        if (t >= 1) {
          setProgress(undefined);
          return;
        }
        setProgress(t);
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      return () => {
        cancelAnimationFrame(frame);
        setProgress(undefined);
      };
    });
  }, [durationMs, enabled, reduceMotion, run]);
  return enabled && !reduceMotion ? progress : undefined;
}

type MoProps = {
  /**
   * Côté enfant, seulement des états positifs ou neutres (`ChildMoState`) ;
   * côté parent, aussi `fierte`, `concentration` et `marche` (`ParentMoState`).
   */
  state: AppMoState;
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
  /**
   * Un petit geste à l'apparition, joué une fois puis Mō ne bouge plus ;
   * toucher Mō le rejoue. Aucun mouvement avec « Réduire les animations ».
   * `idee` (1,4 s, « calme ») : une inspiration, le macron se lève comme une
   * idée puis se repose. `saut` (1,1 s, « bravo ») : un petit saut de
   * confirmation. Sans effet sur un état dont le macron n'est pas isolé.
   */
  gesture?: MoGestureName;
  /** Ombre portée au sol. */
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Mō, la mascotte de Tokō, côté enfant (guide, veille, bravo…) et côté
 * parent (accueil, fierté…), en clair seulement : l'app n'a pas de mode sombre. Règles d'usage :
 * DESIGN.md et la direction « Mō » (un seul Mō par écran, jamais d'état
 * négatif devant l'enfant).
 */
export function Mo({ state, size, label, breathe = false, wave = false, gesture, shadow = true, style }: MoProps) {
  const art = MO_ART[state][pickMoSize(size)];
  const reduceMotion = useReduceMotion();
  const breath = useRef(new Animated.Value(0)).current;
  const canWave = wave && !!art.wave;
  const moves = gesture && art.ground ? MO_GESTURES[gesture] : undefined;
  const [run, setRun] = useState(0);
  const waveT = usePlayOnce(MO_WAVE_DURATION_MS, canWave, reduceMotion, run);
  const wavePose: WavePose | undefined =
    waveT === undefined ? undefined : { hand: moWaveAngle(MO_WAVE_HAND, waveT), body: moWaveAngle(MO_WAVE_BODY, waveT) };
  const gestureT = usePlayOnce(moves?.durationMs ?? 0, !!moves, reduceMotion, run);
  const gesturePose = moves && gestureT !== undefined ? moGesturePose(moves, gestureT) : undefined;
  const playing = waveT !== undefined || gestureT !== undefined;

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
  const drawing = <ArtSvg art={art} size={size} shadow={shadow} wave={wavePose} gesture={gesturePose} />;
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
      {canWave || moves ? (
        // Un clin d'œil, pas une action : hors de portée des lecteurs d'écran,
        // et ignoré tant qu'un salut ou un geste est en cours.
        <Pressable
          accessible={false}
          focusable={false}
          importantForAccessibility="no"
          onPress={() => {
            if (!playing) setRun((n) => n + 1);
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
