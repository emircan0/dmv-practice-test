import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { client } from "./backend";
import { activateStudyScope } from "./studyScope";
import { usePrep } from "./store";
WebBrowser.maybeCompleteAuthSession();
export const authFlags = {
  email: process.env.EXPO_PUBLIC_US_EMAIL_AUTH_ENABLED === "true",
  apple: process.env.EXPO_PUBLIC_US_APPLE_AUTH_ENABLED === "true",
  google: process.env.EXPO_PUBLIC_US_GOOGLE_AUTH_ENABLED === "true",
};
export const useAccount = create<{
  ready: boolean;
  session: Session | null;
  entered: boolean;
  setEntered: () => void;
}>((set) => ({
  ready: false,
  session: null,
  entered: false,
  setEntered: () => set({ entered: true }),
}));
let started = false;
export function initializeAccount() {
  if (started) return;
  started = true;
  if (!client) {
    useAccount.setState({ ready: true });
    return;
  }
  const apply = async (session: Session | null) => {
    if (!usePrep.getState().hydrated)
      await new Promise<void>((resolve) => {
        const unsubscribe = usePrep.subscribe((s) => {
          if (s.hydrated) {
            unsubscribe();
            resolve();
          }
        });
      });
    await activateStudyScope(session?.user.id ?? "guest");
    useAccount.setState({ session, ready: true });
  };
  client.auth
    .getSession()
    .then(({ data, error }) => apply(error ? null : data.session))
    .catch(() => useAccount.setState({ ready: true }));
  client.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => {
      apply(session).catch(() => useAccount.setState({ ready: true }));
    }, 0);
  });
  if (Platform.OS !== "web") {
    if (AppState.currentState === "active") client.auth.startAutoRefresh();
    AppState.addEventListener("change", (state) =>
      state === "active"
        ? client?.auth.startAutoRefresh()
        : client?.auth.stopAutoRefresh(),
    );
  }
}
function enabled(provider: keyof typeof authFlags) {
  if (!client || !authFlags[provider]) throw new Error("authSetup");
  return client;
}
export function authRedirect(next = "verified") {
  return makeRedirectUri({
    scheme: "dmvsmartprep",
    path: "auth/callback",
    queryParams: { next },
  });
}
export const authService = {
  deleteAccount: async () => {
    if (!client || process.env.EXPO_PUBLIC_US_DELETE_ACCOUNT_ENABLED !== "true")
      throw new Error("deletePending");
    const { data: stored } = await client.auth.getSession();
    const deletingSession = stored.session;
    if (!deletingSession) throw new Error("authFailed");
    const { data: current, error: userError } = await client.auth.getUser(deletingSession.access_token);
    if (userError || !current.user) throw new Error("authFailed");
    const owner = current.user.id;
    let appleAuthorizationCode: string | undefined;
    if (Platform.OS === "ios" && current.user.identities?.some((identity) => identity.provider === "apple")) {
      const { appleDeletionCode } = await import("./nativeApple");
      appleAuthorizationCode = await appleDeletionCode();
    }
    const { data, error } = await client.functions.invoke("us-delete-account", {
      body: { confirm: true, appleAuthorizationCode },
      headers: { Authorization: `Bearer ${deletingSession.access_token}` },
    });
    if (error || !data?.deleted) throw new Error("unavailable");
    const { default: storage } = await import(
      "@react-native-async-storage/async-storage"
    );
    // Clear only the deleted owner's data before signOut can switch the scope.
    // Never clear guest history or sign out a different newly signed-in account.
    if (usePrep.getState().studyOwner === owner) usePrep.getState().clearProgress();
    const sessionChanged = useAccount.getState().session?.user.id !== owner;
    if (!sessionChanged) {
      await client.auth.signOut({ scope: "local" });
      await activateStudyScope("guest");
      if (useAccount.getState().session?.user.id === owner) useAccount.setState({ session: null });
    }
    await storage.removeItem("dmv-us-study:" + owner);
    return { appleRevoked: data.appleRevoked, sessionChanged };
  },
  login: async (email: string, password: string) => {
    const { data, error } = await enabled("email").auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error("authFailed");
    await activateStudyScope(data.session.user.id);
    useAccount.setState({ session: data.session });
  },
  register: async (name: string, email: string, password: string) => {
    const { data, error } = await enabled("email").auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: authRedirect(),
      },
    });
    if (error) throw new Error("authFailed");
    if (data.session) {
      await activateStudyScope(data.session.user.id);
      useAccount.setState({ session: data.session });
    }
    return !!data.session;
  },
  reset: async (email: string) => {
    const { error } = await enabled("email").auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: authRedirect("recovery") },
    );
    if (error) throw new Error("authFailed");
  },
  updatePassword: async (password: string) => {
    const { error } = await enabled("email").auth.updateUser({ password });
    if (error) throw new Error("authFailed");
  },
  signOut: async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw new Error("authFailed");
    await activateStudyScope("guest");
    useAccount.setState({ session: null });
  },
  social: async (provider: "apple" | "google") => {
    const backend = enabled(provider);
    if (Constants.appOwnership === "expo") throw new Error("socialDevBuild");
    if (provider === "apple" && Platform.OS === "ios") {
      const { nativeAppleSignIn } = await import("./nativeApple");
      return nativeAppleSignIn();
    }
    const redirectTo = authRedirect();
    const { data, error } = await backend.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw new Error("authFailed");
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return false;
    await completeAuth(result.url);
    return true;
  },
};
const callbackRequests = new Map<string, Promise<string | null>>();
export function completeAuth(url: string): Promise<string | null> {
  const code = new URL(url).searchParams.get("code");
  if (!code) return Promise.reject(new Error("authExpired"));
  const existing = callbackRequests.get(code);
  if (existing) return existing;
  const request = exchangeAuth(url);
  callbackRequests.set(code, request);
  setTimeout(() => callbackRequests.delete(code), 30000);
  return request;
}
async function exchangeAuth(url: string) {
  if (!client) throw new Error("authSetup");
  const params = new URL(url).searchParams;
  if (params.has("error")) throw new Error("authExpired");
  const code = params.get("code");
  if (!code) throw new Error("authExpired");
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw new Error("authExpired");
  if (data.session) {
    await activateStudyScope(data.session.user.id);
    useAccount.setState({ session: data.session });
  }
  return params.get("next");
}
