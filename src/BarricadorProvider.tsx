import { useEffect, useRef, useState, type ReactNode } from "react";
import { BarricadorContext } from "./context";
import { BarricadorStore } from "./store";
import type { UserContext } from "./types";

export interface BarricadorProviderProps {
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
 * Wraps the app, owns the {@link BarricadorStore} lifecycle, and re-evaluates when the user identity
 * changes. Establishes the SSE connection and telemetry flushing. Never blocks rendering: children
 * render immediately and flags resolve to their fallbacks until the first eval lands (unless a
 * `fallback` node is provided to gate on readiness).
 */
export function BarricadorProvider({
  clientKey,
  user,
  baseUrl,
  streaming,
  telemetry,
  flushIntervalMs,
  fallback,
  children,
}: BarricadorProviderProps) {
  const storeRef = useRef<BarricadorStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = new BarricadorStore({
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
    <BarricadorContext.Provider value={storeRef.current}>{children}</BarricadorContext.Provider>
  );
}
