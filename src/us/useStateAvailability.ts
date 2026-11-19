import { useEffect, useState } from "react";
import { loadRelease } from "./backend";
import { STATES } from "./states";

type Availability = "checking" | "ready" | "preparing" | "error";
export function useStateAvailability() {
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<{
    key: string;
    states: Record<string, Availability>;
  }>({ key: "", states: {} });
  const key = `general-first:${revision}`;
  useEffect(() => {
    let cancelled = false;
    Promise.all(STATES.map(async ({ code }) => {
      try {
        const release = await loadRelease(code, "general-first");
        return [code, release?.questions.length ? "ready" : "preparing"] as const;
      } catch {
        return [code, "error"] as const;
      }
    })).then((entries) => {
      if (!cancelled) setData({ key, states: Object.fromEntries(entries) });
    });
    return () => { cancelled = true; };
  }, [key]);
  return {
    status: (code: string): Availability =>
      data.key === key ? data.states[code] ?? "preparing" : "checking",
    refresh: () => setRevision((value) => value + 1),
  };
}
