import { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, X } from "lucide-react-native";

import { BreathingView, DiversionView, SensoryView, TechniqueChooser } from "./sos-views";
import { fonts } from "../ui";
import { sos as copy } from "../../lib/copy";
import { useTheme, type Palette } from "../../lib/theme";
import { sosDismiss, type SosAction, type SosState } from "../../lib/sos";

export function SosOverlay({
  state,
  dispatch,
  onEditList,
}: {
  state: SosState;
  dispatch: (action: SosAction) => void;
  onEditList: (child: { id: string; name: string }) => void;
}) {
  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={state.open}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => dispatch(sosDismiss(state))}
      accessibilityViewIsModal
    >
      <View
        accessibilityLabel={copy.dialogLabel}
        style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}
      >
        <View style={styles.bar}>
          {state.technique ? (
            <Pressable
              onPress={() => dispatch({ type: "back" })}
              accessibilityRole="button"
              accessibilityLabel={copy.back}
              style={styles.back}
            >
              <ArrowLeft size={18} color={c.muted} />
              <Text style={styles.backText}>{copy.back}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            onPress={() => dispatch({ type: "close" })}
            accessibilityRole="button"
            accessibilityLabel={copy.close}
            style={styles.close}
          >
            <X size={22} color={c.muted} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.column}>
            {state.technique === null ? <TechniqueChooser onSelect={(technique) => dispatch({ type: "select", technique })} /> : null}
            {state.technique === "breathing" ? <BreathingView /> : null}
            {state.technique === "sensory" ? <SensoryView /> : null}
            {state.technique === "diversion" ? (
              <DiversionView
                onEditList={(child) => {
                  dispatch({ type: "close" });
                  onEditList(child);
                }}
              />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12 },
    back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, paddingHorizontal: 8 },
    backText: { fontFamily: fonts.medium, fontSize: 16, color: c.muted },
    close: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, alignItems: "center" },
    column: { width: "100%", maxWidth: 600, alignItems: "center" },
  });
