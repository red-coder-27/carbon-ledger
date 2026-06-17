import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * A top-level Error Boundary component to catch React rendering crashes
 * and display a user-friendly fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  /**
   * Catches errors in child components and updates state to trigger fallback UI.
   * @param {Error} _ - The error that was thrown
   * @returns {State} The updated state showing an error occurred
   */
  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  /**
   * Logs error details to console.error for debugging purposes.
   * @param {Error} error - The error object
   * @param {ErrorInfo} errorInfo - The React ErrorInfo object containing component stack
   * @returns {void}
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // SECURITY: Logging errors to console.error is safe in this context for debugging.
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  /**
   * Renders the children components or fallback UI if a crash happened.
   * @returns {ReactNode} The rendered children or fallback UI
   */
  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-moss/20 rounded-xl shadow-sm space-y-4 max-w-md mx-auto my-8 font-sans">
          <div className="w-12 h-12 rounded-full bg-clay/10 flex items-center justify-center text-clay">
            <span className="text-xl">⚠️</span>
          </div>
          <h2 className="text-lg font-serif-journal font-bold text-ink">Something went wrong.</h2>
          <p className="text-sm text-graphite text-center leading-relaxed">
            Please refresh the page or try navigating back to the main ledger dashboard.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-clay text-white text-xs font-bold rounded-lg hover:bg-clay-dark transition"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
