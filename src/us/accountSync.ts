import { client } from "./backend";
import { useAccount } from "./auth";
import { usePrep } from "./store";
import { usePreferences } from "./preferences";
let syncing = false;
export async function syncAccount() {
  if (
    process.env.EXPO_PUBLIC_US_ACCOUNT_SYNC_ENABLED !== "true" ||
    syncing ||
    !client
  )
    return;
  const session = useAccount.getState().session,
    s = usePrep.getState();
  if (!session || s.studyOwner !== session.user.id) return;
  syncing = true;
  try {
    const p = usePreferences.getState();
    const { error } = await client.from("us_profiles").upsert({
      user_id: session.user.id,
      nickname: p.nickname,
      show_ranking: p.showRanking,
      hide_avatar: p.hideAvatar,
    });
    if (error) throw error;
    // Idempotent server RPC. Local history remains available if sync fails.
    for (const a of s.attempts) {
      if (useAccount.getState().session?.user.id !== session.user.id) break;
      if (a.result.correct + a.result.wrong === 0) continue;
      const { error } = await client.rpc("us_record_attempt", {
        p_session_id: a.id,
        p_release_id: a.releaseId,
        p_mode: a.mode,
        p_question_ids: a.questions.map((q) => q.id),
        p_answers: a.answers,
      });
      if (error) throw error;
    }
  } catch {
    /* Keep all device data for retry on foreground or next completion. */
  } finally {
    syncing = false;
  }
}
let active = false;
export function initializeAccountSync() {
  if (active) return;
  active = true;
  usePrep.subscribe((next, previous) => {
    if (next.attempts !== previous.attempts) syncAccount();
  });
  usePreferences.subscribe(() => syncAccount());
  useAccount.subscribe(() => syncAccount());
}
