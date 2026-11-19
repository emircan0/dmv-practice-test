import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Trophy, Medal } from "lucide-react-native";
import {
  Page,
  Card,
  Body,
  Button,
  Busy,
  Heading,
  usePalette,
} from "../../src/us/ui";
import { useT } from "../../src/us/i18n";
import { usePrep } from "../../src/us/store";
import { useAccount } from "../../src/us/auth";
import { stateName } from "../../src/us/states";
import { loadRankings, type Ranking } from "../../src/us/leaderboard";
export default function Leaderboard() {
  const t = useT(),
    p = usePalette(),
    s = usePrep(),
    session = useAccount((a) => a.session),
    [month, setMonth] = useState<0 | 1>(0),
    [metric, setMetric] = useState<"success" | "activity">("success"),
    [rows, setRows] = useState<Ranking[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    if (!session) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError(false);
    setRows([]);
    loadRankings(s.state, s.profile, metric, month)
      .then((data) => {
        if (alive) setRows(data);
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [session?.user.id, s.state, s.profile, month, metric, revision]);
  const tabs = (
    labels: string[],
    selected: number,
    change: (n: number) => void,
  ) => (
    <View
      style={{
        flexDirection: "row",
        padding: 4,
        borderRadius: 14,
        backgroundColor: p.soft,
        gap: 4,
      }}
    >
      {labels.map((label, i) => (
        <Pressable
          key={label}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === i }}
          onPress={() => change(i)}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 11,
            backgroundColor: selected === i ? p.card : "transparent",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: "700",
              color: p.ink,
            }}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
  return (
    <Page title={t("leaderboard")} icon={Trophy} eyebrow={stateName(s.state)}>
      {tabs([t("thisMonth"), t("lastMonth")], month, (n) =>
        setMonth(n as 0 | 1),
      )}
      {tabs(
        [t("successRate"), t("activity")],
        metric === "success" ? 0 : 1,
        (n) => setMetric(n === 0 ? "success" : "activity"),
      )}
      <Body>{t("rankingScope")}</Body>
      {!session ? (
        <Card>
          <Trophy size={48} color="#F59E0B" />
          <Heading>{t("joinRanking")}</Heading>
          <Body>{t("guestAccount")}</Body>
          <Button
            title={t("register")}
            onPress={() => router.push("/auth/register")}
          />
          <Button
            secondary
            title={t("login")}
            onPress={() => router.push("/auth/login")}
          />
        </Card>
      ) : loading ? (
        <Busy />
      ) : rows.length ? (
        <>
          <View
            style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}
          >
            {rows.slice(0, 3).map((entry, i) => (
              <Card
                key={entry.user_id}
                style={{
                  flex: 1,
                  alignItems: "center",
                  padding: 12,
                  paddingTop: i === 0 ? 30 : 15,
                }}
              >
                <Medal size={28} color={["#F59E0B", "#94A3B8", "#B45309"][i]} />
                <Text
                  numberOfLines={1}
                  style={{ color: p.ink, fontWeight: "800" }}
                >
                  {entry.nickname}
                </Text>
                <Body>
                  {metric === "success"
                    ? entry.average_score + "%"
                    : String(entry.total_solved)}
                </Body>
              </Card>
            ))}
          </View>
          <Card>
            {rows.slice(3).map((entry, i) => (
              <View
                key={entry.user_id}
                style={{ flexDirection: "row", gap: 12, paddingVertical: 10 }}
              >
                <Text style={{ color: p.muted }}>{i + 4}</Text>
                <Text style={{ flex: 1, color: p.ink }}>{entry.nickname}</Text>
                <Body>
                  {metric === "success"
                    ? entry.average_score + "%"
                    : String(entry.total_solved)}
                </Body>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Card>
          <Trophy size={36} color="#F59E0B" />
          <Body>{error ? t("unavailable") : t("rankingEmpty")}</Body>
          <Button
            secondary
            title={t("refresh")}
            onPress={() => setRevision((x) => x + 1)}
          />
        </Card>
      )}
    </Page>
  );
}
