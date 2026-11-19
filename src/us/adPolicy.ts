export function createAdFrequency(now: () => number = Date.now) {
  const seen = new Set<string>();
  let count = 0, lastShown = 0;
  return (attemptId: string, mode: string) => {
    if (!["practice", "favorites", "mistakes"].includes(mode) || seen.has(attemptId)) return false;
    seen.add(attemptId);
    if (seen.size > 1000) seen.delete(seen.values().next().value!);
    count++;
    if (count < 3 || (lastShown && now() - lastShown < 120_000)) return false;
    count = 0;
    lastShown = now();
    return true;
  };
}

export interface FullscreenAd {
  addAdEventListener: (event: any, listener: (payload?: any) => void) => () => void;
  load: () => void;
  show: () => Promise<void>;
  destroy: () => void;
}
// Resolve only after close. An earned event, never a load/close event, grants a
// reward. Own and destroy every imperative ad, including error/timeout paths.
export function showFullscreen(ad: FullscreenAd, events: {
  loaded: string; closed: string; error: string; earned?: string;
}, allowed: () => boolean, timeoutMs = 30_000): Promise<number> {
  return new Promise((resolve, reject) => {
    let done = false, credits = 0;
    const off: (() => void)[] = [];
    const finish = (error?: unknown) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      off.forEach((stop) => stop());
      ad.destroy();
      if (error && credits <= 0) reject(new Error("ad_unavailable")); else resolve(credits);
    };
    const timer = setTimeout(() => finish(new Error("ad_timeout")), timeoutMs);
    off.push(ad.addAdEventListener(events.loaded, () => {
      clearTimeout(timer);
      if (!allowed()) { finish(); return; }
      try { void ad.show().catch(finish); } catch (error) { finish(error); }
    }));
    off.push(ad.addAdEventListener(events.closed, () => finish()));
    off.push(ad.addAdEventListener(events.error, finish));
    if (events.earned) off.push(ad.addAdEventListener(events.earned, (reward) => {
      if (Number.isFinite(reward?.amount) && reward.amount > 0)
        credits = Math.floor(reward.amount);
    }));
    try { ad.load(); } catch (error) { finish(error); }
  });
}
