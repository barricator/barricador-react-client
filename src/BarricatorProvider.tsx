import { useEffect, useRef, useState, type ReactNode } from "react";
import { BarricatorContext } from "./context";
import { BarricatorStore } from "./store";
import type { UserContext } from "./types";

export interface BarricatorProviderProps {
  clientKey: string;
  user: UserContext;
  baseUrl?: string;
  streaming?: boolean;
  telemetry?: boolean;
  flushIntervalMs?: number;
  /** Optionally gate children until the first evaluation completes. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Wraps the app, owns the {@link BarricatorStore} lifecycle, and re-evaluates when the user identity
 * changes. Establishes the SSE connection and telemetry flushing. Never blocks rendering: children
 * render immediately and flags resolve to their fallbacks until the first eval lands (unless a
 * `fallback` node is provided to gate on readiness).
 */
export function BarricatorProvider({
  clientKey,
  user,
  baseUrl,
  streaming,
  telemetry,
  flushIntervalMs,
  fallback,
  children,
}: BarricatorProviderProps) {
  const storeRef = useRef<BarricatorStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = new BarricatorStore({
      clientKey,
      user,
      baseUrl,
      streaming,
      telemetry,
      flushIntervalMs,
    });
  }

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const store = storeRef.current!;
    void store.start().finally(() => setReady(true));
    return () => store.close();
    // Intentionally run once; identity changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-evaluate when the user identity (key) changes — e.g. after login/logout.
  const userKey = user.key;
  useEffect(() => {
    if (ready) void storeRef.current!.identify(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  if (fallback !== undefined && !ready) {
    return <>{fallback}</>;
  }

  return (
    <BarricatorContext.Provider value={storeRef.current}>{children}</BarricatorContext.Provider>
  );
}
