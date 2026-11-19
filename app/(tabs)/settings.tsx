import React, { useState } from "react";
import { Alert, View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import {
  User,
  Bell,
  Moon,
  ChevronRight,
  Crown,
  LogOut,
  HelpCircle,
  CreditCard,
  FileText,
  Mail,
  Trash2,
  Clock,
  ShieldCheck,
  Globe,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { Page, Body, Card, usePalette } from "../../src/us/ui";
import { SettingGroup, SettingRow, EditModal, LanguageModal } from "../../src/us/SettingRows";
import { usePreferences } from "../../src/us/preferences";
import { usePrep } from "../../src/us/store";
import { useAccount, authService } from "../../src/us/auth";
import { useT } from "../../src/us/i18n";
import { integrations } from "../../src/us/integrations";
import { stateName } from "../../src/us/states";
import { setReminder } from "../../src/us/reminders";
export default function SettingsScreen() {
  const t = useT(),
    p = usePalette(),
    prefs = usePreferences(),
    s = usePrep(),
    account = useAccount(),
    [editing, setEditing] = useState<"nickname" | "time" | null>(null),
    [showLanguageModal, setShowLanguageModal] = useState(false),
    [value, setValue] = useState("");
  const info = (message: string) => Alert.alert(t("settings"), message);
  const edit = (key: "nickname" | "time") => {
    setValue(key === "nickname" ? prefs.nickname : prefs.reminderTime);
    setEditing(key);
  };
  const reminder = async (enabled: boolean, time = prefs.reminderTime) => {
    try {
      await setReminder(enabled, time, t("brand"), t("reminderBody"));
      setEditing(null);
    } catch {
      info(t("unavailable"));
    }
  };
  const name = account.session?.user.user_metadata?.full_name || t("guest");
  return (
    <Page title={t("settings")} icon={User}>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push(account.session ? "/profile" : "/auth/login")
        }
      >
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 30,
                backgroundColor: p.soft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={28} color={p.muted} />
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={{ fontSize: 20, fontWeight: "600", color: p.ink }}>
                {name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: account.session ? p.muted : "#F59E0B",
                  fontWeight: "600",
                }}
              >
                {account.session?.user.email || t("guestAccount")}
              </Text>
            </View>
            <ChevronRight size={19} color={p.muted} />
          </View>
        </Card>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/premium")}
        style={{
          padding: 20,
          borderRadius: 20,
          backgroundColor: "#FBBF24",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ fontSize: 19, fontWeight: "900", color: "#451A03" }}>
            {t("upgrade")}
          </Text>
          <Text style={{ fontSize: 12, color: "#78350F" }}>
            {t("availableFeatures")}
          </Text>
        </View>
        <Crown size={28} color="#78350F" />
      </Pressable>
      <SettingGroup title={t("account")}>
        <SettingRow
          icon={CreditCard}
          label={t("subscriptions")}
          onPress={() => router.push("/subscriptions")}
        />
        <SettingRow
          icon={User}
          label={t(account.session ? "profileDetails" : "guestAccount")}
          onPress={() =>
            router.push(account.session ? "/profile" : "/auth/login")
          }
        />
      </SettingGroup>
      <SettingGroup title={t("privacySettings")}>
        {process.env.EXPO_PUBLIC_US_ADS_ENABLED === "true" && <SettingRow
          icon={ShieldCheck} label={t("adPrivacyOptions")} onPress={async () => {
            try {
              const ads = integrations.ads();
              if (!ads) { info(t("unavailable")); return; }
              await ads.privacyOptions();
            } catch { info(t("unavailable")); }
          }} /> }
        <SettingRow
          icon={Eye}
          label={t("showRanking")}
          value={prefs.showRanking}
          onPress={() => {}}
          toggle={(v) => {
            if (v && !prefs.nickname.trim()) {
              info(t("nicknamePrivate"));
              edit("nickname");
              return;
            }
            prefs.patch({ showRanking: v });
          }}
        />
        <SettingRow
          icon={EyeOff}
          label={t("hideAvatar")}
          value={prefs.hideAvatar}
          onPress={() => {}}
          toggle={(v) => prefs.patch({ hideAvatar: v })}
        />
        <SettingRow
          icon={User}
          label={t("nickname")}
          value={prefs.nickname}
          onPress={() => edit("nickname")}
        />
      </SettingGroup>
      <SettingGroup title={t("preferences")}>
        <SettingRow
          icon={Bell}
          label={t("notifications")}
          value={prefs.notifications}
          onPress={() => {}}
          toggle={async (v) => {
            if (!v) {
              await reminder(false);
              prefs.patch({ notifications: false });
              return;
            }
            try {
              const N = await import("expo-notifications");
              const permission = await N.requestPermissionsAsync();
              prefs.patch({ notifications: permission.status === "granted" });
              if (permission.status !== "granted") info(t("unavailable"));
            } catch {
              info(t("unavailable"));
            }
          }}
        />
        <SettingRow
          icon={Clock}
          label={t("reminder")}
          value={prefs.reminder}
          onPress={() => {}}
          toggle={(v) => reminder(v)}
        />
        {prefs.reminder && (
          <SettingRow
            icon={Clock}
            label={t("reminderTime")}
            value={prefs.reminderTime}
            onPress={() => edit("time")}
          />
        )}
        <SettingRow
          icon={Moon}
          label={t("darkMode")}
          value={p.dark}
          onPress={() => {}}
          toggle={(v) => prefs.patch({ theme: v ? "dark" : "light" })}
        />
        <SettingRow
          icon={Moon}
          label={t("systemTheme")}
          value={prefs.theme === "system"}
          onPress={() => {}}
          toggle={(v) =>
            prefs.patch({ theme: v ? "system" : p.dark ? "dark" : "light" })
          }
        />
        <SettingRow
          icon={ShieldCheck}
          label={t("shareAnalytics")}
          value={prefs.analytics}
          onPress={() => {}}
          toggle={(v) => prefs.patch({ analytics: v })}
        />
        <SettingRow
          icon={Globe}
          label={t("language")}
          value={s.locale === "en" ? "English" : "Türkçe"}
          onPress={() => setShowLanguageModal(true)}
        />
        <SettingRow
          icon={MapPin}
          label={t("state")}
          value={stateName(s.state)}
          onPress={() => router.push("/onboarding")}
        />
      </SettingGroup>
      <SettingGroup title={t("support")}>
        <SettingRow
          icon={HelpCircle}
          label={t("support")}
          onPress={() => router.push("/support")}
        />
        <SettingRow
          icon={Mail}
          label={t("contact")}
          onPress={() => router.push("/contact")}
        />
        <SettingRow
          icon={FileText}
          label={t("privacyPolicy")}
          onPress={() => router.push("/privacy")}
        />
        <SettingRow
          icon={FileText}
          label={t("terms")}
          onPress={() => router.push("/terms")}
        />
      </SettingGroup>
      <SettingGroup title={t("privacy")}>
        <SettingRow
          icon={Trash2}
          label={t("clear")}
          color="#EF4444"
          onPress={() =>
            Alert.alert(t("clear"), t("clearBody"), [
              { text: t("cancel") },
              {
                text: t("remove"),
                style: "destructive",
                onPress: s.clearProgress,
              },
            ])
          }
        />
        {account.session && (
          <SettingRow
            icon={LogOut}
            label={t("signOut")}
            color="#EF4444"
            onPress={() =>
              Alert.alert(t("signOut"), t("confirmSignOut"), [
                { text: t("cancel") },
                {
                  text: t("signOut"),
                  onPress: async () => {
                    try {
                      await authService.signOut();
                      router.replace("/auth/login");
                    } catch {
                      info(t("authFailed"));
                    }
                  },
                },
              ])
            }
          />
        )}
      </SettingGroup>
      <Body>{t("dataNotSynced")}</Body>
      <Text
        style={{
          color: p.muted,
          textAlign: "center",
          fontSize: 12,
          padding: 10,
        }}
      >
        DMV Smart Prep · v1.0.0
      </Text>
      {editing && (
        <EditModal
          title={t(editing === "nickname" ? "nickname" : "reminderTime")}
          value={value}
          onChange={setValue}
          onClose={() => setEditing(null)}
          onSave={() => {
            if (editing === "nickname") {
              prefs.patch({
                nickname: value.trim().slice(0, 30),
                ...(!value.trim() ? { showRanking: false } : {}),
              });
              setEditing(null);
            } else reminder(true, value);
          }}
        />
      )}
      {showLanguageModal && (
        <LanguageModal
          currentLocale={s.locale}
          onSelect={(locale) => s.setLocale(locale)}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
    </Page>
  );
}
