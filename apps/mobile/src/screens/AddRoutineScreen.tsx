import { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ROUTINE_TEMPLATES } from "@focusflow/validators";
import { ChevronRight } from "lucide-react-native";

import {
  EmptyState,
  Screen,
  ScreenHeader,
  fonts,
} from "../components/ui";
import { addRoutine as copy } from "../lib/copy";
import { useTheme, type Palette } from "../lib/theme";
import { useActiveChild } from "../lib/active-child";
import { useAdoptRoutineTemplate } from "../hooks/use-routines";
import type { AddRoutineProps } from "../navigation/types";

// One-tap authoring on mobile: pick a ready-made template (curated with a
// pediatric neurologist + child psy). The server inserts it transactionally;
// fine-grained custom editing stays on the web. Aligns with the ADHD design
// guardrails — no blank page, one decision per row.
export function AddRoutineScreen({ navigation, route }: AddRoutineProps) {
  const active = useActiveChild().active;
  const childId = route.params?.childId ?? active?.id ?? "";
  const childName = route.params?.childName ?? active?.name ?? "";

  const c = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  const adopt = useAdoptRoutineTemplate();

  function add(templateKey: string, title: string) {
    if (!childId || adopt.isPending) return;
    adopt.mutate(
      { childId, templateKey },
      {
        onSuccess: () => {
          Alert.alert(copy.added(title));
          navigation.goBack();
        },
        onError: () => Alert.alert(copy.error),
      },
    );
  }

  if (!childId) {
    return (
      <Screen scroll>
        <ScreenHeader
          title={copy.title}
          onBack={() => navigation.goBack()}
        />
        <EmptyState
          title="Aucun enfant sélectionné"
          body="Ajoutez un enfant depuis le site, il apparaîtra ici."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title={copy.title}
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />
      <Text style={styles.intro}>{copy.subtitle}</Text>

      {ROUTINE_TEMPLATES.map((t) => {
        const gentle = t.tone === "gentle";
        return (
          <Pressable
            key={t.key}
            onPress={() => add(t.key, t.title)}
            disabled={adopt.isPending}
            accessibilityRole="button"
            accessibilityLabel={`Ajouter la routine ${t.title}`}
            style={[
              styles.card,
              gentle && styles.cardGentle,
              adopt.isPending && styles.disabled,
            ]}
          >
            <Text style={styles.emoji}>{t.emoji}</Text>
            <View style={styles.body}>
              <Text style={styles.name}>{t.title}</Text>
              <Text style={styles.meta}>{copy.steps(t.steps.length)}</Text>
            </View>
            <ChevronRight size={22} color={c.chevron} />
          </Pressable>
        );
      })}

      <Text style={styles.customHint}>{copy.customHint}</Text>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    intro: {
      fontSize: 14,
      color: c.muted,
      fontFamily: fonts.body,
      lineHeight: 20,
      marginBottom: 2,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 16,
      minHeight: 64,
    },
    cardGentle: {
      backgroundColor: c.tipSurface,
      borderColor: c.tipBorder,
    },
    disabled: { opacity: 0.5 },
    emoji: { fontSize: 28 },
    body: { flex: 1 },
    name: { fontSize: 16, color: c.text, fontFamily: fonts.semibold },
    meta: { fontSize: 13, color: c.muted, fontFamily: fonts.body, marginTop: 2 },
    customHint: {
      fontSize: 13,
      color: c.muted,
      fontFamily: fonts.body,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 18,
    },
  });
