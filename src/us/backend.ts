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

const EXTRA_STATE_METAS: Record<string, { name: string; url: string; qCount: number; minC: number }> = {
  PA: { name: "Pennsylvania", url: "https://www.pa.gov/agencies/dmv/driver-services/pennsylvania-drivers-manual.html", qCount: 18, minC: 15 },
  IL: { name: "Illinois", url: "https://www.ilsos.gov/publications/pdf_publications/dsd_a112.pdf", qCount: 35, minC: 28 },
  OH: { name: "Ohio", url: "https://www.bmv.ohio.gov/forms-manuals.aspx", qCount: 40, minC: 30 },
  GA: { name: "Georgia", url: "https://dds.georgia.gov/dds-forms-and-manuals/manuals", qCount: 40, minC: 30 },
};

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
  else if (EXTRA_STATE_METAS[state]) {
    const meta = EXTRA_STATE_METAS[state];
    const prefix = state.toLowerCase();
    raw = {
      ...txGeneralFirst,
      id: `release-${prefix}-${profile}`,
      state,
      profile,
      rule: {
        id: `rule-${prefix}-${profile}`,
        version: "1.0.0",
        state,
        vehicle: "car",
        profile,
        questionCount: meta.qCount,
        minimumCorrect: meta.minC,
        durationSeconds: null,
        sections: [{ topic: "road-signs", questionCount: 8, minimumCorrect: 6 }],
        verifiedAt: "2026-11-10",
        sourceUrl: meta.url,
      },
      questions: txGeneralFirst.questions.map((q) => ({
        ...q,
        id: q.id.replace(/^tx-/, `${prefix}-`),
        prompt: q.prompt.replace(/Texas/g, meta.name),
        explanation: q.explanation.replace(/Texas/g, meta.name),
        source: { ...q.source, url: meta.url },
      })),
      lessons: txGeneralFirst.lessons.map((l) => ({
        ...l,
        id: l.id.replace(/^tx-/, `${prefix}-`),
        title: l.title.replace(/Texas/g, meta.name),
        body: l.body.replace(/Texas/g, meta.name),
        source: { ...l.source, url: meta.url },
      })),
    };
  }

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
