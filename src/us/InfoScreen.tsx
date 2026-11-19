import React from "react";
import { Linking } from "react-native";
import { Page, Card, Body, Button } from "./ui";
import { useT, type MessageKey } from "./i18n";
const urls = {
  support: process.env.EXPO_PUBLIC_US_SUPPORT_URL,
  contact: process.env.EXPO_PUBLIC_US_SUPPORT_EMAIL,
  privacyPolicy: process.env.EXPO_PUBLIC_US_PRIVACY_URL,
  terms: process.env.EXPO_PUBLIC_US_TERMS_URL,
};
export function InfoScreen({ kind }: { kind: keyof typeof urls }) {
  const t = useT(),
    url = urls[kind];
  return (
    <Page title={t(kind)}>
      <Card>
        <Body>
          {t(
            kind === "support"
              ? "helpBody"
              : url
                ? "done"
                : kind === "contact"
                  ? "contactPending"
                  : "legalPending",
          )}
        </Body>
        {url && (
          <Button
            title={t(kind)}
            onPress={() =>
              Linking.openURL(kind === "contact" ? "mailto:" + url : url).catch(
                () => {},
              )
            }
          />
        )}
      </Card>
    </Page>
  );
}
