/** Public types for the Barricador React client SDK. */

export type FlagValue = boolean | string | number | Record<string, unknown> | unknown[] | null;

/** The evaluation subject. `key` must be stable per subject for consistent rollouts. */
export interface UserContext {
  key: string;
  name?: string;
  email?: string;
  country?: string;
  anonymous?: boolean;
  custom?: Record<string, unknown>;
}

export interface BarricadorClientOptions {
  clientKey: string;
  user: UserContext;
  baseUrl?: string;
  /** Enable the live SSE connection (default true). */
  streaming?: boolean;
  /** Enable async telemetry flushing (default true). */
  telemetry?: boolean;
  /** Telemetry flush cadence in ms (default 30000). */
  flushIntervalMs?: number;
}

/** Server response from POST /api/v1/flags/eval — only pre-evaluated values, never raw rules. */
export interface EvalResponse {
  environmentId: string;
  rulesVersion: number;
  values: Record<string, FlagValue>;
  details?: Record<string, { variationId?: string; reason?: string; version?: number }>;
}

export type ConnectionStatus = "initializing" | "ready" | "offline";
