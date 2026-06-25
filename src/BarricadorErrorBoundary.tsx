import { Component, type ErrorInfo, type ReactNode } from "react";

export interface BarricadorErrorBoundaryProps {
  /** Rendered if a descendant throws during render. */
  fallback: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Guarantees the UI degrades gracefully: if flag-driven rendering throws, the boundary shows the
 * provided fallback instead of crashing the tree. Combined with `useFeatureFlag`'s fallback values
 * (returned on any network/eval failure), the app always has a safe default to render.
 */
export class BarricadorErrorBoundary extends Component<BarricadorErrorBoundaryProps, State> {
  constructor(props: BarricadorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
