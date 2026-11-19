import React from "react";
import { View, Text, Pressable, Switch, Modal, TextInput } from "react-native";
import { ChevronRight, Check, type LucideIcon } from "lucide-react-native";
import { usePalette, Button } from "./ui";
import { useT } from "./i18n";
export function SettingGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const p = usePalette();
  return (
    <View style={{ gap: 9 }}>
      <Text
        style={{
          color: p.muted,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.4,
          textTransform: "uppercase",
          marginLeft: 6,
          marginTop: 8,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          borderRadius: 17,
          overflow: "hidden",
          backgroundColor: p.card,
          borderWidth: 1,
          borderColor: p.line,
        }}
      >
        {children}
      </View>
    </View>
  );
}
export function SettingRow({
  icon: Icon,
  label,
  value,
  onPress,
  toggle,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | boolean;
  onPress: () => void;
  toggle?: (value: boolean) => void;
  color?: string;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole={toggle ? undefined : "button"}
      accessible={!toggle}
      onPress={toggle ? undefined : onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        gap: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: p.line,
      }}
    >
      <View style={{ padding: 7, backgroundColor: p.soft, borderRadius: 9 }}>
        <Icon size={18} color={color ?? p.ink} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          color: color ?? p.ink,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
      {toggle ? (
        <Switch
          accessibilityLabel={label}
          value={!!value}
          onValueChange={toggle}
          trackColor={{ false: "#E5E5EA", true: "#34C759" }}
          thumbColor="#FFF"
        />
      ) : (
        <>
          {typeof value === "string" && (
            <Text
              numberOfLines={1}
              style={{ color: p.muted, fontSize: 12, maxWidth: 100 }}
            >
              {value}
            </Text>
          )}
          <ChevronRight size={17} color="#94A3B8" />
        </>
      )}
    </Pressable>
  );
}
export function EditModal({
  title,
  value,
  onChange,
  onSave,
  onClose,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const t = useT(),
    p = usePalette();
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0008",
          justifyContent: "center",
          padding: 25,
        }}
      >
        <View
          style={{
            padding: 24,
            gap: 16,
            borderRadius: 24,
            backgroundColor: p.card,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: p.ink }}>
            {title}
          </Text>
          <TextInput
            accessibilityLabel={title}
            autoFocus
            value={value}
            onChangeText={onChange}
            style={{
              borderWidth: 1,
              borderColor: p.line,
              borderRadius: 12,
              padding: 15,
              color: p.ink,
            }}
          />
          <Button title={t("save")} onPress={onSave} />
          <Button secondary title={t("cancel")} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export function LanguageModal({
  currentLocale,
  onSelect,
  onClose,
}: {
  currentLocale: "en" | "tr";
  onSelect: (locale: "en" | "tr") => void;
  onClose: () => void;
}) {
  const p = usePalette();
  const isEn = currentLocale === "en";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "#0008",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            padding: 24,
            gap: 16,
            borderRadius: 24,
            backgroundColor: p.card,
            borderWidth: 1,
            borderColor: p.line,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: p.ink }}>
            {isEn ? "Select Language" : "Dil Seçin"}
          </Text>

          <View style={{ gap: 10 }}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isEn }}
              onPress={() => {
                onSelect("en");
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 14,
                backgroundColor: isEn ? p.soft : p.bg,
                borderWidth: 1,
                borderColor: isEn ? "#2563EB" : p.line,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>🇺🇸</Text>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: p.ink }}>
                    English
                  </Text>
                  <Text style={{ fontSize: 12, color: p.muted }}>
                    Default (United States)
                  </Text>
                </View>
              </View>
              {isEn && <Check size={20} color="#2563EB" strokeWidth={2.8} />}
            </Pressable>

            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: !isEn }}
              onPress={() => {
                onSelect("tr");
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 14,
                backgroundColor: !isEn ? p.soft : p.bg,
                borderWidth: 1,
                borderColor: !isEn ? "#2563EB" : p.line,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>🇹🇷</Text>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: p.ink }}>
                    Türkçe
                  </Text>
                  <Text style={{ fontSize: 12, color: p.muted }}>
                    Türkçe Çeviri
                  </Text>
                </View>
              </View>
              {!isEn && <Check size={20} color="#2563EB" strokeWidth={2.8} />}
            </Pressable>
          </View>

          <Button secondary title={isEn ? "Cancel" : "Vazgeç"} onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
