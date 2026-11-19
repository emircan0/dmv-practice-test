import React, { useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { usePrep } from "../src/us/store";
import { useT } from "../src/us/i18n";
import { useStateAvailability } from "../src/us/useStateAvailability";
import { STATES, isTargetState } from "../src/us/states";
import {
  Page,
  Card,
  Body,
  Button,
  Heading,
  colors,
  usePalette,
} from "../src/us/ui";
import { Welcome } from "../src/us/Welcome";
export default function Onboarding() {
  const p = usePalette();
  const t = useT(),
    s = usePrep();
  const [state, setState] = useState(isTargetState(s.state) ? s.state : "CA"),
    [search, setSearch] = useState("");
  const [step, setStep] = useState(s.onboarded ? 3 : 0);
  const availability = useStateAvailability();
  const canContinue = availability.status(state) === "ready";
  const noReadyStates = STATES.every((item) => availability.status(item.code) === "preparing");
  if (step < 3)
    return (
      <Welcome
        step={step}
        onNext={() => setStep(step + 1)}
        onSkip={() => setStep(3)}
      />
    );
  return (
    <Page
      title={t("chooseState")}
      eyebrow={t("setupEyebrow")}
      subtitle={t("selectBody")}
    >
      <Card>
        <Heading>{t("chooseState")}</Heading>
        <Body>{t("stateNote")}</Body>
        <TextInput
          accessibilityLabel={t("chooseState")}
          placeholder={t("chooseState")}
          value={search}
          onChangeText={setSearch}
          style={{
            borderWidth: 1,
            borderColor: p.line,
            padding: 14,
            borderRadius: 12,
            color: p.ink,
            backgroundColor: p.card,
            fontSize: 16,
          }}
        />
        <ScrollView nestedScrollEnabled style={{ maxHeight: 300 }}>
          {STATES.filter(
            (x) =>
              x.name.toLowerCase().includes(search.toLowerCase()) ||
              x.code.toLowerCase() === search.toLowerCase(),
          ).map((x) => (
            <Pressable
              key={x.code}
              accessibilityRole="radio"
              accessibilityState={{ checked: state === x.code, disabled: availability.status(x.code) !== "ready" }}
              disabled={availability.status(x.code) !== "ready"}
              onPress={() => setState(x.code)}
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: state === x.code ? p.soft : p.card,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: p.ink,
                  fontWeight: state === x.code ? "800" : "400",
                }}
              >
                {state === x.code ? "✓  " : ""}
                {x.name}
                {" · "}{t(availability.status(x.code) === "ready" ? "stateReady" : availability.status(x.code) === "checking" ? "stateChecking" : availability.status(x.code) === "error" ? "stateCheckFailed" : "statePreparing")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Card>
      {noReadyStates && <Body>{t("noReadyStates")}</Body>}
      <Button title={t("refresh")} secondary onPress={availability.refresh} />
      <Body>{t("contentLanguage")}</Body>
      <Button
        title={s.onboarded ? t("save") : t("continue")}
        disabled={!canContinue}
        onPress={() => {
          const save = () => {
            s.configure(state);
            router.replace("/(tabs)");
          };
          if (s.active)
            Alert.alert(t("discard"), t("active"), [
              { text: t("cancel") },
              { text: t("continue"), onPress: save },
            ]);
          else save();
        }}
      />
      <Body>{t("disclaimer")}</Body>
    </Page>
  );
}
