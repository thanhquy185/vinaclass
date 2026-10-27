import { Component } from "react";
import type { ErrorInfo } from "react";
import ErrorFallback from "./ErrorFallback";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/** Catches rendering errors in the React component tree. */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Render the fallback UI after an error.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Send this error to the configured error reporting service.
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Store error details for the development fallback.
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Connect the application error reporting service.
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Use the supplied fallback when available.
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use the default fallback.
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
