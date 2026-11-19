import React from "react";
import { Redirect, Tabs } from "expo-router";
import {
  Home,
  BookOpen,
  ClipboardList,
  BarChart3,
  Settings,
  BrainCircuit,
  Trophy,
} from "lucide-react-native";
import { isTargetState } from "../../src/us/states";
import { usePrep } from "../../src/us/store";
import { useT } from "../../src/us/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, useWindowDimensions } from "react-native";
import { colors, usePalette } from "../../src/us/ui";
export default function Layout() {
  const palette = usePalette();
  const { width } = useWindowDimensions();
  const t = useT(),
    onboarded = usePrep((s) => s.onboarded),
    state = usePrep((s) => s.state);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 8);
  if (!onboarded || !isTargetState(state)) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0066FF",
        tabBarInactiveTintColor: "#91A6C0",
        tabBarStyle: {
          backgroundColor: palette.dark ? palette.card : "#FFFFFFF2",
          borderTopColor: palette.line,
          height: 60 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: { fontSize: width < 360 ? 9 : 10, fontWeight: "600", marginTop: 4 },
        tabBarItemStyle: { paddingHorizontal: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t("dashboardExamsTab"),
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-tutor"
        options={{
          title: t("coach"),
          tabBarIcon: ({ color, size }) => (
            <BrainCircuit color={color} size={size} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen name="learn" options={{ href: null }} />
      <Tabs.Screen
        name="progress"
        options={{
          title: t("dashboardStatsTab"),
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t("leaderboard"),
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
