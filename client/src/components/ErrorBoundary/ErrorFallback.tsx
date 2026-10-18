import type { ErrorInfo } from "react";

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError?: () => void;
}

/**
 * ErrorFallback - UI hiển thị khi có lỗi trong ErrorBoundary
 */
export default function ErrorFallback({
  error,
  errorInfo,
  resetError,
}: ErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Oops! Có lỗi xảy ra
            </h1>
            <p className="text-gray-600">
              Đã xảy ra lỗi không mong muốn trong ứng dụng
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Thông báo lỗi:
            </h2>
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="break-all font-mono text-sm text-red-800">
                {error.message || "Unknown error"}
              </p>
            </div>
          </div>
        )}

        {/* Error Stack (Development only) */}
        {isDevelopment && error?.stack && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Stack trace:
            </h2>
            <div className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                {error.stack}
              </pre>
            </div>
          </div>
        )}

        {/* Component Stack (Development only) */}
        {isDevelopment && errorInfo?.componentStack && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Component stack:
            </h2>
            <div className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                {errorInfo.componentStack}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {resetError && (
            <button
              onClick={resetError}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Thử lại
            </button>
          )}
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300"
          >
            Về trang chủ
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Nếu lỗi tiếp tục xảy ra, vui lòng liên hệ với bộ phận hỗ trợ.
        </p>
      </div>
    </div>
  );
}
