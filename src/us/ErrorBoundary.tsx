import React from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";

type State = { failed: boolean };

/**
 * Last line of defence: a render error must never leave the user on a blank
 * screen. Shows a calm recovery screen and lets the user retry without
 * losing locally stored progress (state lives in persisted stores).
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof __DEV__ !== "undefined" && __DEV__) console.warn(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <Fallback onRetry={() => this.setState({ failed: false })} />;
  }
}

function Fallback({ onRetry }: { onRetry: () => void }) {
  const dark = useColorScheme() === "dark";
  const ink = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#94A3B8" : "#64748B";
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 12,
        backgroundColor: dark ? "#0B1120" : "#F8FAFC",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "800", color: ink }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: muted, textAlign: "center" }}>
        Your progress is saved on this device. Please try again.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={{
          marginTop: 8,
          minHeight: 48,
          paddingHorizontal: 28,
          borderRadius: 14,
          backgroundColor: "#2563EB",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}
