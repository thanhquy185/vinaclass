import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";

/**
 * ErrorPage - Trang hiển thị lỗi cho React Router
 * Được sử dụng như errorElement trong route configuration
 */
export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.DEV;

  // Xác định loại lỗi và lấy thông tin
  let errorMessage = "Đã xảy ra lỗi không xác định";
  let errorStatus = "Error";
  let errorDetails = "";

  if (isRouteErrorResponse(error)) {
    // Lỗi từ React Router (404, 500, etc.)
    errorStatus = `${error.status}`;
    errorMessage = error.statusText || errorMessage;
    errorDetails = error.data?.message || "";
  } else if (error instanceof Error) {
    // Lỗi JavaScript thông thường
    errorMessage = error.message;
    errorDetails = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  console.error("Route Error:", error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
            <svg
              className="h-8 w-8 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Lỗi trang</h1>
              {errorStatus && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                  {errorStatus}
                </span>
              )}
            </div>
            <p className="text-gray-600">Không thể tải trang này</p>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            Thông báo lỗi:
          </h2>
          <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
            <p className="break-all font-mono text-sm text-purple-800">
              {errorMessage}
            </p>
          </div>
        </div>

        {/* Error Details (Development only) */}
        {isDevelopment && errorDetails && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Chi tiết lỗi:
            </h2>
            <div className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                {errorDetails}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300"
          >
            ← Quay lại
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
          >
            Về trang chủ
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Nếu bạn nghĩ đây là lỗi hệ thống, vui lòng liên hệ với chúng tôi.
        </p>
      </div>
    </div>
  );
}
