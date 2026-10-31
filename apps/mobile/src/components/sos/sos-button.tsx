import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Animated, Easing, Keyboard, Pressable, StyleSheet, View } from "react-native";
import { HeartPulse } from "lucide-react-native";

import { SosOverlay } from "./sos-overlay";
import { sos as copy } from "../../lib/copy";
import { FLOATING_BUTTON_RIGHT, FLOATING_BUTTON_SIZE } from "../../lib/floating-inset";
import { whenMotionAllowed } from "../../lib/reduce-motion";
import { SOS_CLOSED, sosReducer } from "../../lib/sos";
import { useTheme, type Palette } from "../../lib/theme";

export function SosButton({
  bottom,
  onEditList,
}: {
  bottom: number;
  onEditList: (child: { id: string; name: string }) => void;
}) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [state, dispatch] = useReducer(sosReducer, SOS_CLOSED);
  const [keyboard, setKeyboard] = useState(false);
  const halo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboard(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboard(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(
    () =>
      whenMotionAllowed(() => {
        const loop = Animated.loop(
          Animated.timing(halo, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        );
        loop.start();
        return () => {
          loop.stop();
          halo.setValue(0);
        };
      }),
    [halo],
  );

  return (
    <>
      {keyboard ? null : (
        <View pointerEvents="box-none" style={[styles.anchor, { bottom }]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
                transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
              },
            ]}
          />
          <Pressable
            onPress={() => dispatch({ type: "open" })}
            accessibilityRole="button"
            accessibilityLabel={copy.openLabel}
            testID="sos-button"
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <HeartPulse size={24} color="#ffffff" />
          </Pressable>
        </View>
      )}
      <SosOverlay state={state} dispatch={dispatch} onEditList={onEditList} />
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    anchor: {
      position: "absolute",
      right: FLOATING_BUTTON_RIGHT,
      width: FLOATING_BUTTON_SIZE,
      height: FLOATING_BUTTON_SIZE,
    },
    halo: {
      position: "absolute",
      width: FLOATING_BUTTON_SIZE,
      height: FLOATING_BUTTON_SIZE,
      borderRadius: FLOATING_BUTTON_SIZE / 2,
      backgroundColor: c.danger,
    },
    button: {
      width: FLOATING_BUTTON_SIZE,
      height: FLOATING_BUTTON_SIZE,
      borderRadius: FLOATING_BUTTON_SIZE / 2,
      backgroundColor: c.danger,
      borderWidth: 4,
      borderColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    pressed: { transform: [{ scale: 0.95 }] },
  });
