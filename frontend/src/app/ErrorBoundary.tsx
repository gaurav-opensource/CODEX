import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Keep runtime stream failures isolated from the rest of the application shell.
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
          <div className="max-w-md rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">CORTEX runtime guard</p>
            <h1 className="mt-3 text-2xl font-black text-white">The interface hit an unexpected error.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Refresh the page to retry. Backend recovery services continue operating independently.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
