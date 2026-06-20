# barricator-react-client

Client-side **React SDK** for Barricator. TypeScript, React 18+.

## Security model

Browsers are untrusted, so the SDK never downloads rulesets. It POSTs the `UserContext` to the
backend `/api/v1/flags/eval` with a low-privilege **client key**; the server evaluates targeting
internally and returns a flattened `key → value` map. An SSE connection signals environment changes,
prompting a re-fetch. Telemetry is buffered and flushed asynchronously.

## Usage

```tsx
import {
  BarricatorProvider,
  BarricatorErrorBoundary,
  useFeatureFlag,
  useFeatureFlagEnabled,
} from "@barricator/react-client";

function App() {
  return (
    <BarricatorProvider
      clientKey="sdk-cli-..."
      user={{ key: "user-123", email: "user@enterprise.com", custom: { plan: "pro" } }}
      baseUrl="https://app.barricator.io"
    >
      <BarricatorErrorBoundary fallback={<Classic />}>
        <Home />
      </BarricatorErrorBoundary>
    </BarricatorProvider>
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
provided fallback. `BarricatorErrorBoundary` guarantees the UI still renders a safe default if
flag-driven rendering throws. `useBarricatorStatus()` exposes `initializing | ready | offline`.

## Build

```bash
npm install
npm run build      # emits dist/ (.js + .d.ts)
npm run typecheck
```
