import { useMemo, useState, type ReactNode, type Ref } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { Check, CircleAlert, Eye, EyeOff } from "lucide-react-native";

import { fonts } from "./ui";
import { WEB_URL } from "../lib/config";
import { useTheme, type Palette } from "../lib/theme";

export const TERMS_URL = `${WEB_URL}/cgu`;
export const PRIVACY_URL = `${WEB_URL}/confidentialite`;

export function openWebPage(url: string) {
  void WebBrowser.openBrowserAsync(url);
}

export function useAuthStyles() {
  const c = useTheme();
  return { c, s: useMemo(() => makeAuthStyles(c), [c]) };
}

export function AuthScaffold({ children }: { children: ReactNode }) {
  const { s } = useAuthStyles();
  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.content}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const { s } = useAuthStyles();
  return (
    <View style={s.heading}>
      <Text style={s.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

type FieldProps = Omit<TextInputProps, "style"> & {
  label: string;
  id: string;
  hint?: string;
  ref?: Ref<TextInput>;
};

export function AuthField({ label, id, hint, ref, ...input }: FieldProps) {
  const { c, s } = useAuthStyles();
  return (
    <View style={s.field}>
      <Text style={s.label} nativeID={`${id}-label`}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        style={s.input}
        accessibilityLabel={label}
        accessibilityLabelledBy={`${id}-label`}
        accessibilityHint={hint}
        placeholderTextColor={c.muted}
        autoCorrect={false}
        importantForAutofill="yes"
        {...input}
      />
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export function PasswordField({ label, id, hint, ref, ...input }: FieldProps) {
  const { c, s } = useAuthStyles();
  const [visible, setVisible] = useState(false);
  return (
    <View style={s.field}>
      <Text style={s.label} nativeID={`${id}-label`}>
        {label}
      </Text>
      <View style={s.passwordRow}>
        <TextInput
          ref={ref}
          style={[s.input, s.passwordInput]}
          accessibilityLabel={label}
          accessibilityLabelledBy={`${id}-label`}
          accessibilityHint={hint}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          importantForAutofill="yes"
          {...input}
        />
        <Pressable
          style={s.eye}
          onPress={() => setVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? <EyeOff size={22} color={c.muted} /> : <Eye size={22} color={c.muted} />}
        </Pressable>
      </View>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export function AuthError({ message }: { message: string | null }) {
  const { c, s } = useAuthStyles();
  if (!message) return null;
  return (
    <View style={s.errorBox} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <CircleAlert size={20} color={c.dangerFg} style={s.errorIcon} />
      <Text style={s.errorText}>{message}</Text>
    </View>
  );
}

export function AuthPrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const { c, s } = useAuthStyles();
  const off = disabled || loading;
  return (
    <Pressable
      style={({ pressed }) => [s.button, pressed && s.pressed, off && s.disabled]}
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: off, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={c.onPrimary} />
      ) : (
        <Text style={s.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthLink({
  label,
  a11yLabel,
  onPress,
  align = "center",
  accessibilityRole = "button",
  disabled,
}: {
  label: string;
  a11yLabel?: string;
  onPress: () => void;
  align?: "center" | "flex-end" | "flex-start";
  accessibilityRole?: "button" | "link";
  disabled?: boolean;
}) {
  const { s } = useAuthStyles();
  return (
    <Pressable
      style={({ pressed }) => [s.link, { alignSelf: align }, pressed && s.pressed]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={a11yLabel ?? label}
      hitSlop={4}
    >
      <Text style={s.linkText}>{label}</Text>
    </Pressable>
  );
}

export type NoticeLink = { link: string; onPress: () => void; after?: string };

const NOTICE_SLOP = { top: 13, bottom: 13, left: 4, right: 4 };

export function AuthNotice({ parts }: { parts: ReadonlyArray<string | NoticeLink> }) {
  const { s } = useAuthStyles();
  const sentence = parts.map((p) => (typeof p === "string" ? p : `${p.link}${p.after ?? ""}`)).join(" ");
  const items: ReactNode[] = [];
  let first = true;
  parts.forEach((part, i) => {
    const last = i === parts.length - 1;
    if (typeof part === "string") {
      const words = part.split(" ");
      words.forEach((word, j) => {
        const space = last && j === words.length - 1 ? "" : " ";
        items.push(
          <Text
            key={`${i}-${j}`}
            style={s.notice}
            {...(first
              ? { accessibilityLabel: sentence }
              : { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: "no" as const })}
          >
            {word + space}
          </Text>,
        );
        first = false;
      });
      return;
    }
    items.push(
      <Pressable
        key={i}
        onPress={part.onPress}
        accessibilityRole="link"
        accessibilityLabel={part.link}
        hitSlop={NOTICE_SLOP}
        style={({ pressed }) => pressed && s.pressed}
      >
        <Text style={s.notice}>
          <Text style={s.noticeLink}>{part.link}</Text>
          {(part.after ?? "") + (last ? "" : " ")}
        </Text>
      </Pressable>,
    );
  });
  return (
    <View pointerEvents="box-none" style={s.noticeRow}>
      {items}
    </View>
  );
}

export function AuthCheckbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const { c, s } = useAuthStyles();
  return (
    <Pressable
      style={s.checkRow}
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      aria-checked={checked}
      accessibilityLabel={label}
    >
      <View style={[s.checkbox, checked && s.checkboxOn]}>
        {checked ? <Check size={18} color={c.onPrimary} strokeWidth={3} /> : null}
      </View>
      <Text style={s.checkText}>{label}</Text>
    </Pressable>
  );
}

export const makeAuthStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 24 },
    content: { width: "100%", maxWidth: 420, alignSelf: "center", gap: 24 },
    hero: { alignItems: "center", gap: 2 },
    heading: { alignItems: "center", gap: 8 },
    title: {
      fontFamily: fonts.heading,
      fontSize: 33,
      lineHeight: 37,
      letterSpacing: -0.8,
      color: c.text,
      textAlign: "center",
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 16,
      lineHeight: 22,
      color: c.muted,
      textAlign: "center",
    },
    body: {
      fontFamily: fonts.body,
      fontSize: 16,
      lineHeight: 23,
      color: c.text,
      textAlign: "center",
    },
    bodyStrong: { fontFamily: fonts.semibold },
    form: { gap: 16 },
    field: { gap: 6 },
    label: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
    hint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: c.muted },
    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: fonts.body,
      color: c.text,
      backgroundColor: c.card,
    },
    passwordRow: { justifyContent: "center" },
    passwordInput: { paddingRight: 56 },
    eye: {
      position: "absolute",
      right: 2,
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.dangerBorder,
      backgroundColor: c.dangerSurface,
    },
    errorIcon: { marginTop: 1 },
    errorText: {
      flex: 1,
      fontFamily: fonts.medium,
      fontSize: 15,
      lineHeight: 21,
      color: c.dangerFg,
    },
    button: {
      minHeight: 56,
      backgroundColor: c.primary,
      borderRadius: 16,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    buttonText: { color: c.onPrimary, fontSize: 17, fontFamily: fonts.bold },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.6 },
    link: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
    linkText: {
      fontFamily: fonts.semibold,
      fontSize: 15,
      color: c.brandStrong,
      textDecorationLine: "underline",
    },
    footer: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 6,
    },
    footerText: { fontFamily: fonts.body, fontSize: 15, color: c.muted, textAlign: "center" },
    checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 44, paddingVertical: 4 },
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: c.text,
      backgroundColor: c.card,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    checkboxOn: { backgroundColor: c.primary, borderColor: c.primary },
    checkText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: c.text },
    legalLinks: { flexDirection: "row", flexWrap: "wrap", columnGap: 20, marginTop: -6, paddingLeft: 38 },
    notice: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: c.muted, textAlign: "center" },
    noticeLink: { color: c.brandStrong, textDecorationLine: "underline", fontFamily: fonts.medium },
    noticeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      paddingVertical: NOTICE_SLOP.top,
      marginVertical: -NOTICE_SLOP.top,
    },
  });
