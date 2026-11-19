import React, { useState } from "react";
import { TextInput, Alert } from "react-native";
import { Redirect } from "expo-router";
import { User } from "lucide-react-native";
import { Page, Card, Body, Button, Heading, usePalette } from "../src/us/ui";
import { useT } from "../src/us/i18n";
import { useAccount, authService } from "../src/us/auth";
import { client } from "../src/us/backend";
export default function Profile() {
  const t = useT(),
    p = usePalette(),
    session = useAccount((a) => a.session),
    [name, setName] = useState(session?.user.user_metadata?.full_name ?? ""),
    [busy, setBusy] = useState(false);
  if (!session) return <Redirect href="/auth/login" />;
  return (
    <Page title={t("profileDetails")} icon={User}>
      <Card>
        <Heading>{t("fullName")}</Heading>
        <TextInput
          accessibilityLabel={t("fullName")}
          value={name}
          onChangeText={setName}
          style={{
            padding: 15,
            borderRadius: 12,
            backgroundColor: p.soft,
            color: p.ink,
          }}
        />
        <Body>{session.user.email}</Body>
        <Button
          title={t("save")}
          disabled={busy}
          onPress={async () => {
            if (!name.trim()) return;
            setBusy(true);
            try {
              const result = await client!.auth.updateUser({
                data: { full_name: name.trim() },
              });
              Alert.alert(
                t("profileDetails"),
                t(result.error ? "unavailable" : "saved"),
              );
            } catch {
              Alert.alert(t("profileDetails"), t("unavailable"));
            } finally {
              setBusy(false);
            }
          }}
        />
      </Card>
      <Body>{t("dataNotSynced")}</Body>
      <Button
        secondary
        title={t("resetPassword")}
        onPress={() =>
          import("expo-router").then(({ router }) =>
            router.push("/auth/forgot-password"),
          )
        }
      />
      <Button
        secondary
        title={t("deleteAccount")}
        onPress={() =>
          Alert.alert(t("deleteAccount"), t("deleteConfirm"), [
            { text: t("cancel") },
            {
              text: t("remove"),
              style: "destructive",
              onPress: async () => {
                try {
                  const result = await authService.deleteAccount();
                  if (result.appleRevoked === false) Alert.alert(t("deleteAccount"), t("appleGrantRemoval"));
                  const { router } = await import("expo-router");
                  router.replace(result.sessionChanged ? "/(tabs)" : "/auth/login");
                } catch (e) {
                  if (e instanceof Error && e.message === "cancelled") return;
                  Alert.alert(
                    t("deleteAccount"),
                    t(
                      e instanceof Error && e.message === "deletePending"
                        ? "deletePending"
                        : "unavailable",
                    ),
                  );
                }
              },
            },
          ])
        }
      />
    </Page>
  );
}
