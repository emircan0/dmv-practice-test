import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  GraduationCap,
  type LucideIcon,
} from "lucide-react-native";
import { usePreferences } from "./preferences";
export const colors = {
  bg: "#F8FAFC",
  ink: "#0F172A",
  muted: "#64748B",
  blue: "#2563EB",
  line: "#F1F5F9",
  green: "#059669",
  red: "#E11D48",
  purple: "#4F46E5",
};
export function usePalette() {
  const theme = usePreferences((s) => s.theme),
    system = useColorScheme();
  const dark = theme === "dark" || (theme === "system" && system === "dark");
  return {
    ...colors,
    dark,
    card: dark ? "#0F172A" : "#FFFFFF",
    soft: dark ? "#1E293B" : "#F1F5F9",
    bg: dark ? "#020617" : colors.bg,
    ink: dark ? "#F8FAFC" : colors.ink,
    muted: dark ? "#94A3B8" : colors.muted,
    line: dark ? "#1E293B" : colors.line,
  };
}
// Visual tokens ported from the original ScreenLayout and dashboard cards.
export function Page({
  title,
  subtitle,
  eyebrow,
  icon: Icon = GraduationCap,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  const palette = usePalette();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.bg }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <View
          style={[
            styles.row,
            { justifyContent: "space-between", marginBottom: 10 },
          ]}
        >
          <View style={{ flex: 1 }}>
            {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
            <Text style={[styles.title, { color: palette.ink }]}>{title}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon size={23} color={colors.purple} />
          </View>
        </View>
        {subtitle && <Body>{subtitle}</Body>}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const p = usePalette();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: p.card, borderColor: p.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Body({ children }: { children: React.ReactNode }) {
  const p = usePalette();
  return <Text style={[styles.body, { color: p.muted }]}>{children}</Text>;
}
export function Heading({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const p = usePalette();
  return <Text style={[styles.heading, { color: p.ink }, style]}>{children}</Text>;
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? palette.soft : colors.blue,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: secondary ? palette.ink : "#FFF",
          fontWeight: "800",
          fontSize: 14,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Hero({
  label,
  title,
  body,
  action,
  onPress,
  icon: Icon,
  color = colors.blue,
  disabled = false,
}: {
  label: string;
  title: string;
  body: string;
  action: string;
  onPress: () => void;
  icon: LucideIcon;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.hero, { backgroundColor: color }]}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -18,
          bottom: -25,
          opacity: 0.12,
          transform: [{ rotate: "12deg" }],
        }}
      >
        <Icon size={160} color="#FFF" strokeWidth={1.7} />
      </View>
      <View style={styles.badge}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "900",
            letterSpacing: 1.6,
            color: "#FFF",
          }}
        >
          {label.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text
        style={{
          color: "#FFFFFFD9",
          fontSize: 14,
          lineHeight: 21,
          maxWidth: "90%",
          marginBottom: 10,
        }}
      >
        {body}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.row,
          {
            alignSelf: "flex-start",
            backgroundColor: "#FFF",
            borderRadius: 14,
            paddingVertical: 13,
            paddingHorizontal: 19,
            opacity: disabled ? 0.65 : 1,
            marginTop: 8,
          },
        ]}
      >
        <Text style={{ color, fontWeight: "800", fontSize: 14 }}>{action}</Text>
        <ChevronRight color={color} size={17} />
      </Pressable>
    </View>
  );
}
export function Shortcut({
  label,
  icon: Icon,
  color,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        {
          flex: 1,
          minWidth: 72,
          padding: 13,
          alignItems: "center",
          gap: 9,
          borderRadius: 22,
        },
      ]}
    >
      <View
        style={{ padding: 11, borderRadius: 17, backgroundColor: color + "12" }}
      >
        <Icon size={23} color={color} />
      </View>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "800",
          color: colors.muted,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Busy() {
  return (
    <ActivityIndicator
      size="large"
      color={colors.blue}
      style={{ margin: 30 }}
    />
  );
}
export const styles = StyleSheet.create({
  page: {
    padding: 22,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 18,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: "#94A3B8",
    fontWeight: "800",
    marginBottom: 7,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -1,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muted,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 19,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 10,
    shadowColor: "#CBD5E1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { padding: 23, borderRadius: 28, overflow: "hidden", gap: 9 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#FFFFFF26",
    borderWidth: 1,
    borderColor: "#FFFFFF38",
    marginBottom: 7,
  },
  heroTitle: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.8,
    fontWeight: "900",
    color: "#FFF",
  },
});
