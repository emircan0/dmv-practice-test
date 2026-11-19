import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { completeAuth } from "../../src/us/auth";
import { Page, Body, Button, Busy } from "../../src/us/ui";
import { useT } from "../../src/us/i18n";
export default function Callback() {
  const t = useT(),
    params = useLocalSearchParams<{ code?: string; next?: string }>(),
    [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    async function finish() {
      try {
        const url = Linking.createURL("auth/callback", {
          queryParams: { ...params },
        });
        const next = await completeAuth(url);
        if (alive)
          router.replace(next === "recovery" ? "/auth/reset-password" : "/");
      } catch {
        if (alive) setError(true);
      }
    }
    finish();
    return () => {
      alive = false;
    };
  }, [params.code]);
  return (
    <Page title={t("login")}>
      {error ? (
        <>
          <Body>{t("authExpired")}</Body>
          <Button
            title={t("login")}
            onPress={() => router.replace("/auth/login")}
          />
        </>
      ) : (
        <Busy />
      )}
    </Page>
  );
}
