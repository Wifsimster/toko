import { useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import * as Haptics from "expo-haptics";

import { useTheme } from "../lib/theme";

/** Appui long avant que la ligne se soulève (ms). */
const LIFT_DELAY = 250;
const SETTLE = { duration: 160 };

/**
 * Liste courte (quelques lignes) réordonnable par appui long puis glisser.
 *
 * Les lignes sont placées en absolu, une par pas (`hauteur + gap`) : la ligne
 * tenue suit le doigt, les autres glissent vers leur nouvelle place. L'ordre
 * reste au parent : `onDragMove(id, to)` donne la place visée, comptée dans
 * l'ordre du moment où la ligne a été soulevée, et le parent en déduit la
 * nouvelle liste. Une vibration courte marque la prise, chaque changement de
 * place et la pose.
 *
 * Le glisser n'est pas accessible au lecteur d'écran : le parent garde des
 * boutons (et des actions d'accessibilité) pour monter ou descendre.
 */
export function SortableList<T extends string>({
  items,
  gap = 8,
  renderItem,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  items: readonly T[];
  gap?: number;
  renderItem: (id: T, index: number) => ReactNode;
  onDragStart: (id: T) => void;
  onDragMove: (id: T, to: number) => void;
  onDragEnd: (id: T) => void;
}) {
  // Hauteur d'une ligne, mesurée (taille de police du système) ; 64 avant
  // la première mesure.
  const [rowHeight, setRowHeight] = useState(64);
  const stride = rowHeight + gap;
  const count = useSharedValue(items.length);
  useEffect(() => {
    count.value = items.length;
  }, [count, items.length]);

  const measure = (e: LayoutChangeEvent) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    setRowHeight((prev) => (h > prev ? h : prev));
  };

  const handlers = {
    start: (id: T) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDragStart(id);
    },
    move: (id: T, to: number) => {
      void Haptics.selectionAsync();
      onDragMove(id, to);
    },
    end: (id: T) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDragEnd(id);
    },
  };

  return (
    <View style={{ height: Math.max(items.length * stride - gap, 0) }}>
      {items.map((id, index) => (
        <SortableRow
          key={id}
          id={id}
          index={index}
          stride={stride}
          minHeight={rowHeight}
          count={count}
          enabled={items.length > 1}
          onLayout={measure}
          handlers={handlers}
        >
          {renderItem(id, index)}
        </SortableRow>
      ))}
    </View>
  );
}

function SortableRow<T extends string>({
  id,
  index,
  stride,
  minHeight,
  count,
  enabled,
  onLayout,
  handlers,
  children,
}: {
  id: T;
  index: number;
  stride: number;
  minHeight: number;
  count: SharedValue<number>;
  enabled: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  handlers: {
    start: (id: T) => void;
    move: (id: T, to: number) => void;
    end: (id: T) => void;
  };
  children: ReactNode;
}) {
  const c = useTheme();
  const top = useSharedValue(index * stride);
  const lifted = useSharedValue(false);
  const from = useSharedValue(index);
  const hover = useSharedValue(index);
  const strideSV = useSharedValue(stride);

  // Place prise dans l'ordre courant (après un glisser, un bouton, un ajout) ;
  // la ligne tenue, elle, suit le doigt.
  useEffect(() => {
    strideSV.value = stride;
    if (!lifted.value) top.value = withTiming(index * stride, SETTLE);
  }, [index, stride, lifted, strideSV, top]);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .activateAfterLongPress(LIFT_DELAY)
    .onStart(() => {
      lifted.value = true;
      from.value = Math.round(top.value / strideSV.value);
      hover.value = from.value;
      scheduleOnRN(handlers.start, id);
    })
    .onUpdate((e) => {
      const max = (count.value - 1) * strideSV.value;
      const y = Math.min(Math.max(from.value * strideSV.value + e.translationY, 0), max);
      top.value = y;
      const to = Math.round(y / strideSV.value);
      if (to !== hover.value) {
        hover.value = to;
        scheduleOnRN(handlers.move, id, to);
      }
    })
    .onFinalize(() => {
      if (!lifted.value) return;
      lifted.value = false;
      top.value = withTiming(hover.value * strideSV.value, SETTLE);
      scheduleOnRN(handlers.end, id);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: top.value }, { scale: withTiming(lifted.value ? 1.03 : 1, SETTLE) }],
    zIndex: lifted.value ? 10 : 0,
    elevation: withTiming(lifted.value ? 8 : 0, SETTLE),
    shadowOpacity: withTiming(lifted.value ? 0.18 : 0, SETTLE),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        // Fond plein : sans lui, Android ne dessine pas l'ombre (elevation).
        style={[styles.row, { minHeight, backgroundColor: c.card, shadowColor: c.text }, style]}
        onLayout={onLayout}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
});
