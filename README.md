# barricador-react-client

[![npm](https://img.shields.io/npm/v/@barricador/react-client?label=npm)](https://www.npmjs.com/package/@barricador/react-client)

Client-side **React SDK** for Barricador. TypeScript, React 18+.

## Install

```bash
npm install @barricador/react-client
# peer dependency: react >= 18
```

## Security model

Browsers are untrusted, so the SDK never downloads rulesets. It POSTs the `UserContext` to the
backend `/api/v1/flags/eval` with a low-privilege **client key**; the server evaluates targeting
internally and returns a flattened `key → value` map. An SSE connection signals environment changes,
prompting a re-fetch. Telemetry is buffered and flushed asynchronously.

## Usage

```tsx
import {
  BarricadorProvider,
  BarricadorErrorBoundary,
  useFeatureFlag,
  useFeatureFlagEnabled,
} from "@barricador/react-client";

function App() {
  return (
    <BarricadorProvider
      clientKey="sdk-cli-..."
      user={{ key: "user-123", email: "user@enterprise.com", custom: { plan: "pro" } }}
      baseUrl="https://app.barricador.com"
    >
      <BarricadorErrorBoundary fallback={<Classic />}>
        <Home />
      </BarricadorErrorBoundary>
    </BarricadorProvider>
  );
}

function Home() {
  const newCheckout = useFeatureFlagEnabled("new-checkout", false);
  const theme = useFeatureFlag<string>("homepage-theme", "control");
  return newCheckout ? <NewCheckout theme={theme} /> : <Classic />;
}
```

## Re-render discipline

`useFeatureFlag` uses `useSyncExternalStore` with a **per-key subscription**, so a component
re-renders only when *its* flag value changes — not on every flag update.

## Resilience

Network/eval failures never throw: the SDK keeps the last values and unknown flags return the
provided fallback. `BarricadorErrorBoundary` guarantees the UI still renders a safe default if
flag-driven rendering throws. `useBarricadorStatus()` exposes `initializing | ready | offline`.

## Build

```bash
npm install
npm run build      # emits dist/ (.js + .d.ts)
npm run typecheck
```
