import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { usePrep } from "../src/us/store";
import { initializeMonetization } from "../src/us/monetization";
import { Busy } from "../src/us/ui";
import { initializeAccountSync } from "../src/us/accountSync";
import { initializeAccount, useAccount } from "../src/us/auth";
import { ErrorBoundary } from "../src/us/ErrorBoundary";
export default function Layout() {
  const ready = useAccount((s) => s.ready);
  useEffect(() => {
    initializeAccountSync();
    initializeAccount();
    initializeMonetization();
    // Watchdog: a stalled network call must never trap the user on the splash
    // spinner. A late session result still applies when it eventually arrives.
    const watchdog = setTimeout(() => {
      if (!useAccount.getState().ready) useAccount.setState({ ready: true });
    }, 8000);
    return () => clearTimeout(watchdog);
  }, []);
  const hydrated = usePrep((s) => s.hydrated);
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        {hydrated && ready ? (
          <Stack screenOptions={{ headerShown: false }} />
        ) : (
          <Busy />
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
