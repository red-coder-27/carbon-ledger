import { Component, ErrorInfo, ReactNode } from 'react';

/** Props for the ErrorBoundary component. */
interface ErrorBoundaryProps {
  /** React child nodes to be wrapped by the boundary */
  readonly children: ReactNode;
}

/** State for the ErrorBoundary component. */
interface ErrorBoundaryState {
  /** True if a rendering crash was caught in the child subtree, false otherwise */
  readonly hasError: boolean;
}

/**
 * A top-level Error Boundary component to catch React rendering crashes
 * and display a user-friendly fallback UI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  /**
   * Catches errors in child components and updates state to trigger fallback UI.
   * 
   * @param {Error} _ - The error that was thrown
   * @returns {ErrorBoundaryState} The updated state showing an error occurred
   */
  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  /**
   * Logs error details to console.error for debugging purposes.
   * 
   * @param {Error} error - The error object
   * @param {ErrorInfo} errorInfo - The React ErrorInfo object containing component stack
   * @returns {void}
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  /**
   * Renders the children components or fallback UI if a crash happened.
   * 
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
            onClick={(): void => window.location.reload()}
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

export default ErrorBoundary;
