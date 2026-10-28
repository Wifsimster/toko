import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Animated, Easing, Image, StyleSheet, View } from "react-native";

import { useReduceMotion, whenMotionAllowed } from "../../lib/reduce-motion";
import { hideNativeSplash } from "../../lib/splash";
import { colors } from "../ui";

// Même image, même taille et même fond que l'écran de démarrage natif
// (`app.json`, plugin expo-splash-screen : `imageWidth` 180, centrée sur
// l'écran) : le passage du natif à l'app ne fait ni saut ni changement de
// dessin.
const SPLASH_IMAGE = require("../../../assets/splash-icon-light.png");
const SPLASH_IMAGE_DP = 180;
// Le sol de Mō dans cette image (ombre, `apps/web/scripts/generate-icons.mjs`) :
// Mō respire depuis le sol, comme `Mo breathe`.
const GROUND = "50% 73.8%";
// Une respiration de Mō (4 s, échelle 1 → 1,03), comme `.mo-breathe` sur le
// web, mais en boucle tant que l'app charge.
const HALF_BREATH_MS = 2000;
// Si l'image tarde, on retire quand même l'écran natif.
const SPLASH_TIMEOUT_MS = 1500;

/**
 * L'écran de chargement : Mō respire doucement, en boucle, tant que l'app
 * démarre (session à relire). Immobile avec « Réduire les animations ».
 * Retire l'écran de démarrage natif dès que son image est dessinée.
 */
export function MoLoader() {
  const reduceMotion = useReduceMotion();
  const [breath] = useState(() => new Animated.Value(0));
  // La respiration commence une fois l'écran natif retiré : la première
  // image est exactement celle du natif.
  const [shown, setShown] = useState(false);

  const show = useCallback(() => {
    requestAnimationFrame(() => {
      hideNativeSplash();
      setShown(true);
    });
  }, []);

  useEffect(() => {
    const fallback = setTimeout(show, SPLASH_TIMEOUT_MS);
    return () => clearTimeout(fallback);
  }, [show]);

  useEffect(() => {
    if (!shown || reduceMotion) {
      breath.setValue(0);
      return;
    }
    return whenMotionAllowed(() => {
      const half = { duration: HALF_BREATH_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breath, { toValue: 1, ...half }),
          Animated.timing(breath, { toValue: 0, ...half }),
        ]),
      );
      loop.start();
      return () => {
        loop.stop();
        breath.setValue(0);
      };
    });
  }, [shown, reduceMotion, breath]);

  return (
    <View style={s.screen} accessible accessibilityRole="progressbar" accessibilityLabel="Chargement">
      <View style={s.box}>
        <Animated.View
          style={[
            s.box,
            {
              transformOrigin: GROUND,
              transform: [
                { scaleX: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) },
                { scaleY: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
              ],
            },
          ]}
        >
          <Image source={SPLASH_IMAGE} style={s.box} fadeDuration={0} onLoadEnd={show} />
        </Animated.View>
        <ActivityIndicator color={colors.brand} style={s.spinner} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  box: { width: SPLASH_IMAGE_DP, height: SPLASH_IMAGE_DP },
  // Sous Mō, hors du flux : Mō reste au centre exact, comme sur l'écran natif.
  spinner: { position: "absolute", top: SPLASH_IMAGE_DP, alignSelf: "center" },
});
