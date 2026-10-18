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

/**
 * ErrorBoundary - Component để bắt lỗi trong React component tree
 *
 * Sử dụng:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * hoặc với custom fallback:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
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
    // Cập nhật state để hiển thị fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Có thể log lỗi vào service như Sentry, LogRocket, etc.
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Lưu error info vào state để hiển thị chi tiết
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Gửi lỗi đến error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
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
      // Nếu có custom fallback, sử dụng nó
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sử dụng ErrorFallback mặc định
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
