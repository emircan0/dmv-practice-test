import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Sparkles, Rocket } from "lucide-react-native";
import { useT } from "./i18n";
import { Button, colors, usePalette } from "./ui";
export function Welcome({
  step,
  onNext,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const t = useT(),
    p = usePalette();
  const slides = [
    {
      Icon: Trophy,
      color: "#007AFF",
      title: t("selectWelcome"),
      body: t("selectWelcomeBody"),
    },
    {
      Icon: Sparkles,
      color: "#AF52DE",
      title: t("selectCoachTitle"),
      body: t("selectCoachBody"),
    },
    {
      Icon: Rocket,
      color: "#34C759",
      title: t("selectExamTitle"),
      body: t("selectExamBody"),
    },
  ];
  const slide = slides[step];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: p.bg }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 520,
          alignSelf: "center",
          padding: 28,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onSkip}
          style={{ alignSelf: "flex-end", padding: 10 }}
        >
          <Text style={{ color: p.muted, fontWeight: "600" }}>{t("skip")}</Text>
        </Pressable>
        <View style={{ gap: 25 }}>
          <View
            style={{
              width: 108,
              height: 108,
              borderRadius: 30,
              backgroundColor: slide.color + "12",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <slide.Icon color={slide.color} size={52} strokeWidth={1.7} />
          </View>
          <Text
            style={{
              fontSize: 38,
              lineHeight: 44,
              fontWeight: "900",
              letterSpacing: -1.5,
              color: p.ink,
            }}
          >
            {slide.title}
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 25, color: p.muted }}>
            {slide.body}
          </Text>
        </View>
        <View style={{ gap: 20 }}>
          <View
            style={{ flexDirection: "row", gap: 7, justifyContent: "center" }}
          >
            {slides.map((x, i) => (
              <View
                key={i}
                style={{
                  height: 6,
                  width: i === step ? 25 : 6,
                  borderRadius: 5,
                  backgroundColor: i === step ? slide.color : "#CBD5E1",
                }}
              />
            ))}
          </View>
          <Button title={t("continue")} onPress={onNext} />
        </View>
      </View>
    </SafeAreaView>
  );
}
