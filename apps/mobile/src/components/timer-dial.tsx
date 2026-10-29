import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { dialBackgroundArt } from "@focusflow/mo/child";

import { ArtPaths } from "./mo/art";

const CENTER = 60;
const R = 46;
const TRACK = 10;
const OUTLINE = 2.2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const INK = "#1E2A2E";

export function TimerDial({
  size,
  progress,
  color,
  children,
}: {
  size: number;
  progress: number;
  color: string;
  children?: ReactNode;
}) {
  const p = Math.min(1, Math.max(0, progress));
  const arc = {
    cx: CENTER,
    cy: CENTER,
    r: R,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeDasharray: `${CIRCUMFERENCE} ${CIRCUMFERENCE}`,
    strokeDashoffset: CIRCUMFERENCE * (1 - p),
    transform: `rotate(-90 ${CENTER} ${CENTER})`,
  };
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={StyleSheet.absoluteFill}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width={size} height={size} viewBox={dialBackgroundArt.viewBox}>
          <ArtPaths art={dialBackgroundArt} />
          {p > 0 ? (
            <>
              <Circle {...arc} stroke={INK} strokeWidth={TRACK + OUTLINE} />
              <Circle {...arc} stroke={color} strokeWidth={TRACK - OUTLINE} />
            </>
          ) : null}
        </Svg>
      </View>
      <View style={styles.center} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});
