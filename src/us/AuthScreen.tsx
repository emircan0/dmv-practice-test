import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Car, Mail, Lock, User, ChevronRight, ChevronLeft } from "lucide-react-native";
import { useT, type MessageKey, en } from "./i18n";
import * as Apple from "expo-apple-authentication";
import { authService, authFlags, useAccount } from "./auth";
import { usePrep } from "./store";

export function AuthScreen({
  mode = "login",
}: {
  mode?: "login" | "register" | "forgot" | "reset";
}) {
  const t = useT();
  const currentLocale = usePrep((s) => s.locale);
  const isEn = currentLocale !== "tr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<MessageKey | null>(null);
  const [success, setSuccess] = useState(false);

  const goHome = () => {
    useAccount.getState().setEntered();
    router.replace(usePrep.getState().onboarded ? "/(tabs)" : "/onboarding");
  };

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    setSuccess(false);
    try {
      await action();
    } catch (e) {
      const key = e instanceof Error ? e.message : "";
      setMessage(key in en ? (key as MessageKey) : "authFailed");
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(async () => {
      if (
        mode !== "reset" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        setMessage("validEmail");
        return;
      }
      if ((mode === "register" || mode === "reset") && password.length < 8) {
        setMessage("validPassword");
        return;
      }
      if (mode === "login" && !password) {
        setMessage("validPassword");
        return;
      }
      if (mode === "register" && !name.trim()) {
        setMessage("requiredName");
        return;
      }
      if (mode === "login") {
        await authService.login(email, password);
        goHome();
      }
      if (mode === "register") {
        const signedIn = await authService.register(name, email, password);
        if (signedIn) goHome();
        else {
          setSuccess(true);
          setMessage("checkEmail");
        }
      }
      if (mode === "forgot") {
        await authService.reset(email);
        setSuccess(true);
        setMessage("resetSent");
      }
      if (mode === "reset") {
        await authService.updatePassword(password);
        goHome();
      }
    });

  const renderInput = (
    value: string,
    onChangeText: (v: string) => void,
    label: MessageKey,
    secret = false,
  ) => (
    <View style={st.inputContainer}>
      <View style={st.inputIconWrapper}>
        {secret ? (
          <Lock size={18} color="rgba(255, 255, 255, 0.6)" />
        ) : label === "fullName" ? (
          <User size={18} color="rgba(255, 255, 255, 0.6)" />
        ) : (
          <Mail size={18} color="rgba(255, 255, 255, 0.6)" />
        )}
      </View>
      <TextInput
        accessibilityLabel={t(label)}
        placeholder={t(label)}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        style={st.textInput}
        value={value}
        onChangeText={onChangeText}
        editable={!busy}
        secureTextEntry={secret}
        autoCapitalize={label === "fullName" ? "words" : "none"}
        autoCorrect={false}
        keyboardType={label === "email" ? "email-address" : "default"}
        textContentType={
          label === "email"
            ? "emailAddress"
            : secret
              ? mode === "login"
                ? "password"
                : "newPassword"
              : "name"
        }
      />
    </View>
  );

  const title = t(
    mode === "login"
      ? "login"
      : mode === "register"
        ? "register"
        : mode === "forgot"
          ? "forgotPassword"
          : "resetPassword",
  );

  return (
    <ImageBackground
      source={require("../../assets/images/driving-bg.jpg")}
      style={st.bgImage}
      resizeMode="cover"
    >
      <View style={st.overlay}>
        <SafeAreaView style={st.safeArea} edges={["top", "bottom", "left", "right"]}>
          {/* Top Bar with Clear Guest Pill & Back Action */}
          <View style={st.topBar}>
            {mode === "forgot" || mode === "reset" ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace("/auth/login")}
                style={st.backBtn}
              >
                <ChevronLeft size={22} color="#FFF" />
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={goHome}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={st.guestPill}
            >
              <Text style={st.guestPillText}>{t("guestAccess")}</Text>
              <ChevronRight size={14} color="rgba(255, 255, 255, 0.7)" />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={st.scrollContent}
            >
              {/* Brand Header */}
              <View style={st.brandHeader}>
                <View style={st.brandBadge}>
                  <Car size={26} color="#FFF" strokeWidth={2.2} />
                </View>
                <Text style={st.brandTitle}>DMV Smart Prep</Text>
                <Text style={st.brandTagline}>{t("authTagline")}</Text>
              </View>

              {/* Main Card */}
              <View style={st.card}>
                {/* Segmented Switcher for Login / Register */}
                {(mode === "login" || mode === "register") && (
                  <View style={st.segmentContainer}>
                    <Pressable
                      onPress={() => router.replace("/auth/login")}
                      style={[st.segmentTab, mode === "login" && st.segmentTabActive]}
                    >
                      <Text
                        style={[st.segmentText, mode === "login" && st.segmentTextActive]}
                      >
                        {t("login")}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.replace("/auth/register")}
                      style={[st.segmentTab, mode === "register" && st.segmentTabActive]}
                    >
                      <Text
                        style={[
                          st.segmentText,
                          mode === "register" && st.segmentTextActive,
                        ]}
                      >
                        {t("register")}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Form Inputs */}
                <View style={st.formGroup}>
                  {mode === "register" && renderInput(name, setName, "fullName")}
                  {mode !== "reset" && renderInput(email, setEmail, "email")}
                  {mode !== "forgot" &&
                    renderInput(
                      password,
                      setPassword,
                      mode === "reset" ? "newPassword" : "password",
                      true,
                    )}
                </View>

                {mode === "login" && (
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => router.push("/auth/forgot-password")}
                    style={st.forgotBtn}
                  >
                    <Text style={st.forgotText}>{t("forgotPassword")}</Text>
                  </Pressable>
                )}

                {/* Feedback Messages */}
                {message && (
                  <View
                    accessibilityRole="alert"
                    style={[
                      st.messageBanner,
                      {
                        backgroundColor: success
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        borderColor: success
                          ? "rgba(16, 185, 129, 0.3)"
                          : "rgba(239, 68, 68, 0.3)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        st.messageText,
                        { color: success ? "#34D399" : "#F87171" },
                      ]}
                    >
                      {t(message)}
                    </Text>
                  </View>
                )}

                {/* Primary Action Button */}
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={submit}
                  style={[st.primaryBtn, { opacity: busy ? 0.6 : 1 }]}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={st.primaryBtnText}>
                        {t(
                          mode === "forgot"
                            ? "sendReset"
                            : mode === "reset"
                              ? "updatePassword"
                              : mode,
                        )}
                      </Text>
                      <ChevronRight size={18} color="#FFF" />
                    </>
                  )}
                </Pressable>

                {/* Social Login Section */}
                {(mode === "login" || mode === "register") && (
                  <>
                    <View style={st.dividerWrapper}>
                      <View style={st.dividerLine} />
                      <Text style={st.dividerText}>
                        {isEn ? "OR" : "VEYA"}
                      </Text>
                      <View style={st.dividerLine} />
                    </View>

                    {(["apple", "google"] as const)
                      .filter(
                        (provider) => provider === "apple" || authFlags.google,
                      )
                      .map((provider) =>
                        provider === "apple" && Platform.OS === "ios" ? (
                          <View
                            key="apple"
                            pointerEvents={busy ? "none" : "auto"}
                            style={{ opacity: busy ? 0.6 : 1, width: "100%", height: 44 }}
                          >
                            <Apple.AppleAuthenticationButton
                              buttonType={
                                Apple.AppleAuthenticationButtonType.SIGN_IN
                              }
                              buttonStyle={
                                Apple.AppleAuthenticationButtonStyle.WHITE
                              }
                              cornerRadius={8}
                              style={{ width: "100%", height: 44 }}
                              onPress={() =>
                                run(async () => {
                                  if (await authService.social("apple"))
                                    goHome();
                                })
                              }
                            />
                          </View>
                        ) : (
                          <Pressable
                            key={provider}
                            accessibilityRole="button"
                            disabled={busy}
                            onPress={() =>
                              run(async () => {
                                if (await authService.social(provider))
                                  goHome();
                              })
                            }
                            style={[
                              st.socialBtn,
                              {
                                backgroundColor:
                                  provider === "apple" ? "#FFF" : "rgba(255, 255, 255, 0.08)",
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: provider === "apple" ? "#111" : "#4285F4",
                                fontSize: 20,
                                fontWeight: "800",
                              }}
                            >
                              {provider === "apple" ? "" : "G"}
                            </Text>
                            <Text
                              style={[
                                st.socialBtnText,
                                { color: provider === "apple" ? "#111" : "#FFF" },
                              ]}
                            >
                              {t(provider === "apple" ? "withApple" : "withGoogle")}
                            </Text>
                          </Pressable>
                        ),
                      )}
                  </>
                )}

                {/* Subtitle toggle when in forgot mode */}
                {mode === "forgot" && (
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => router.replace("/auth/login")}
                    style={{ padding: 12 }}
                  >
                    <Text style={st.switchText}>
                      {isEn ? "Back to Sign in" : "Giriş ekranına dön"}
                    </Text>
                  </Pressable>
                )}

                {/* SÖZLEŞMELER & YASAL UYARI (LEGAL FOOTER) */}
                <View style={st.legalContainer}>
                  <Text style={st.legalText}>
                    {isEn ? "By continuing, you agree to our " : "Devam ederek "}
                    <Text
                      style={st.legalLink}
                      onPress={() => router.push("/terms")}
                    >
                      {isEn ? "Terms of Service" : "Kullanım Koşulları"}
                    </Text>
                    <Text style={st.legalText}>{isEn ? " and " : " ve "}</Text>
                    <Text
                      style={st.legalLink}
                      onPress={() => router.push("/privacy")}
                    >
                      {isEn ? "Privacy Policy" : "Gizlilik Politikası"}
                    </Text>
                    {!isEn && (
                      <Text style={st.legalText}>'nı kabul etmiş olursunuz.</Text>
                    )}
                    .
                  </Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const st = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 17, 32, 0.86)", // Rich, clean dark tint
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  guestPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  guestPillText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: -0.2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 26,
    padding: 22,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  segmentTabActive: {
    backgroundColor: "#2563EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  formGroup: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    height: 52,
  },
  inputIconWrapper: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  forgotText: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "500",
  },
  messageBanner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  primaryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dividerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  socialBtn: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  switchText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontSize: 13,
  },
  legalContainer: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  legalText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  legalLink: {
    color: "#60A5FA",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
