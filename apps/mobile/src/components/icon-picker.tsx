import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, ImagePlus, X } from "lucide-react-native";

import { ICON_CHOICES, iconForEmoji, normalizeEmoji } from "../lib/icon-for";
import { iconPicker as copy } from "../lib/copy";
import { useReduceMotion } from "../lib/reduce-motion";
import { useTheme, type Palette } from "../lib/theme";
import { ItemIcon } from "./item-icon";
import { fonts } from "./ui";

/**
 * Sélecteur d'icône d'une routine ou d'une étape : un bouton qui montre le
 * dessin choisi et ouvre une grille de dessins Mō (`ICON_CHOICES`). La valeur
 * reste l'emoji enregistré en base (voir lib/icon-for.ts) : choisir un dessin
 * enregistre son emoji canonique, « Sans icône » enregistre une chaîne vide.
 * Un emoji posé depuis le site sans équivalent Mō est gardé tel quel tant
 * que le parent ne choisit rien d'autre.
 */
export function IconPicker({
  value,
  onChange,
  name,
  size = 44,
}: {
  value: string;
  onChange: (emoji: string) => void;
  /** Ce que l'icône illustre (« la routine », « l'étape 2 ») : nom accessible. */
  name: string;
  size?: number;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  const current = normalizeEmoji(value);
  const spec = iconForEmoji(current);
  const selected = ICON_CHOICES.find((o) => normalizeEmoji(o.emoji) === current);

  function pick(emoji: string) {
    onChange(emoji);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[s.trigger, { width: size + 8, height: size + 8 }]}
        accessibilityRole="button"
        accessibilityLabel={copy.choose(name)}
        accessibilityValue={{ text: selected?.label ?? (current ? copy.fromWeb : copy.none) }}
      >
        {spec ? (
          <ItemIcon spec={spec} size={size - 8} />
        ) : current ? (
          // Emoji du site sans dessin Mō : une pastille neutre, jamais l'emoji.
          <View style={s.dot} />
        ) : (
          <ImagePlus size={20} color={c.muted} />
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType={reduceMotion ? "none" : "fade"}
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.backdrop}>
          <View style={s.sheet}>
            <View style={s.head}>
              <Text style={s.title}>{copy.title}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                style={s.close}
                accessibilityRole="button"
                accessibilityLabel={copy.close}
              >
                <X size={22} color={c.text} />
              </Pressable>
            </View>
            {/* Une trentaine de dessins : la grille défile sur les petits écrans. */}
            <ScrollView style={s.scroll} contentContainerStyle={s.grid}>
              {ICON_CHOICES.map((o) => {
                const on = o === selected;
                return (
                  <Pressable
                    key={o.emoji}
                    onPress={() => pick(o.emoji)}
                    style={[s.cell, on && s.cellOn]}
                    accessibilityRole="button"
                    accessibilityLabel={o.label}
                    accessibilityState={{ selected: on }}
                  >
                    <ItemIcon spec={o.spec} size={40} />
                    <Text style={s.cellLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                      {o.label}
                    </Text>
                    {on ? (
                      <View style={s.tick}>
                        <Check size={12} color={c.onPrimary} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              onPress={() => pick("")}
              style={[s.none, !current && s.cellOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: !current }}
            >
              <Text style={s.noneText}>{copy.none}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    trigger: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
    },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.muted },
    backdrop: { flex: 1, backgroundColor: "rgba(30, 42, 46, 0.4)", justifyContent: "center", padding: 20 },
    sheet: { backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 12, maxHeight: "100%" },
    scroll: { flexGrow: 0, flexShrink: 1 },
    head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: { fontSize: 17, color: c.text, fontFamily: fonts.semibold },
    close: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -10 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    cell: {
      width: "18%",
      flexGrow: 1,
      minHeight: 72,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      paddingVertical: 6,
    },
    // Sélection : anneau encre, pas la couleur seule (DIRECTION.md).
    cellOn: { borderColor: c.primary, borderWidth: 2.5 },
    cellLabel: { fontSize: 11, color: c.subtext, fontFamily: fonts.medium },
    tick: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    none: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    noneText: { fontSize: 15, color: c.text, fontFamily: fonts.medium },
  });
