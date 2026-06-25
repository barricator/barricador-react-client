import { useCallback, useContext, useSyncExternalStore } from "react";
import { BarricadorContext } from "./context";
import type { ConnectionStatus, FlagValue } from "./types";

function useStore() {
  const store = useContext(BarricadorContext);
  if (!store) {
    throw new Error("useFeatureFlag must be used within a <BarricadorProvider>");
  }
  return store;
}

/**
 * Read a single flag's evaluated value. Backed by {@link useSyncExternalStore} with a per-key
 * subscription, so a component using this hook re-renders ONLY when this flag's value changes — not
 * when any other flag updates. Returns `fallback` until the value is known (or on any failure).
 */
export function useFeatureFlag<T extends FlagValue>(key: string, fallback: T): T {
  const store = useStore();
  const subscribe = useCallback(
    (cb: () => void) => store.subscribeKey(key, cb),
    [store, key],
  );
  const getSnapshot = useCallback(
    () => store.getValue(key, fallback) as T,
    [store, key, fallback],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Convenience boolean variant. */
export function useFeatureFlagEnabled(key: string, fallback = false): boolean {
  const value = useFeatureFlag<FlagValue>(key, fallback);
  return typeof value === "boolean" ? value : fallback;
}

/** Observe the SDK connection status (initializing / ready / offline). */
export function useBarricadorStatus(): ConnectionStatus {
  const store = useStore();
  const subscribe = useCallback((cb: () => void) => store.subscribeStatus(cb), [store]);
  const getSnapshot = useCallback(() => store.getStatus(), [store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
