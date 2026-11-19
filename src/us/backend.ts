import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { isTargetState } from "./states";
import { validateRelease } from "./engine";
import type { CandidateProfile, ContentRelease } from "./model";

import caGeneralFirst from "../../data/releases/ca-general-first.json";
import txGeneralFirst from "../../data/releases/tx-general-first.json";
import flGeneralFirst from "../../data/releases/fl-general-first.json";
import nyGeneralFirst from "../../data/releases/ny-general-first.json";

// Deliberately no fallback to the copied Turkish .env or EAS configuration.
const url = process.env.EXPO_PUBLIC_US_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_US_SUPABASE_PUBLISHABLE_KEY;
export const backendConfigured =
  !!url && !!key && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url);
export const client = backendConfigured
  ? createClient(url!, key!, {
      auth: {
        storage: AsyncStorage,
        storageKey: "dmv-us-auth-v1",
        flowType: "pkce",
        lock: processLock,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function getBundledRelease(
  state: string,
  profile: CandidateProfile,
): ContentRelease | null {
  if (!isTargetState(state)) return null;

  let raw: any = null;
  if (state === "CA") raw = caGeneralFirst;
  else if (state === "TX") raw = txGeneralFirst;
  else if (state === "FL") raw = flGeneralFirst;
  else if (state === "NY") raw = nyGeneralFirst;

  if (!raw) return null;

  try {
    return validateRelease(
      {
        ...raw,
        state,
        profile,
        rule: raw.rule ? { ...raw.rule, state, profile } : null,
      },
      state,
      profile,
    );
  } catch {
    return null;
  }
}

export async function loadRelease(
  state: string,
  profile: CandidateProfile,
): Promise<ContentRelease | null> {
  if (!isTargetState(state)) return null;

  if (client) {
    try {
      const { data, error } = await client
        .from("us_content_releases")
        .select("id,version,state,profile,vehicle,language,published_at,payload")
        .eq("state", state)
        .eq("profile", profile)
        .eq("vehicle", "car")
        .eq("language", "en")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.payload) {
        return validateRelease(
          {
            ...data.payload,
            id: data.id,
            version: data.version,
            state: data.state,
            profile: data.profile,
            vehicle: data.vehicle,
            language: data.language,
            publishedAt: data.published_at,
          },
          state,
          profile,
        );
      }
    } catch {
      // Fallback to local bundled release if network/query fails
    }
  }

  // Graceful offline & bundled fallback
  return getBundledRelease(state, profile);
}
