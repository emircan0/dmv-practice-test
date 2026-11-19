import { useCallback, useEffect, useRef, useState } from "react";
import { loadRelease } from "./backend";
import { usePrep } from "./store";
import type { ContentRelease } from "./model";
export function useContent() {
  const state = usePrep((s) => s.state),
    profile = usePrep((s) => s.profile);
  const [data, setData] = useState<{
    key: string;
    release: ContentRelease | null;
  }>({ key: "", release: null });
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(false);
  const generation = useRef(0);
  const key = state + ":" + profile;
  const refresh = useCallback(async () => {
    const id = ++generation.current;
    setLoading(true);
    setError(false);
    try {
      const release = await loadRelease(state, profile);
      if (id === generation.current)
        setData({ key: state + ":" + profile, release });
    } catch {
      if (id === generation.current) {
        setError(true);
        setData({ key: state + ":" + profile, release: null });
      }
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }, [state, profile]);
  useEffect(() => {
    refresh();
    return () => {
      generation.current++;
    };
  }, [refresh]);
  return {
    release: data.key === key ? data.release : null,
    loading,
    error,
    refresh,
  };
}
