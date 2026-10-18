import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import React, { useEffect } from "react";

const GoogleCallback: React.FC = () => {
  // Lấy hàm xử lý logic và các trạng thái từ Hook
  const { handleGoogleCallback, error } = useGoogleAuth();

  const GoogleCallback = () => {
    handleGoogleCallback();
  };

  useEffect(() => {
    GoogleCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all">
        {error ? (
          /* Giao diện khi có lỗi */
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Rất tiếc, đã có lỗi xảy ra!
            </h2>
            <p className="mb-6 leading-relaxed text-gray-600">
              {error || "Đã có sự cố trong quá trình xác thực tài khoản."}
            </p>

            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-md transition duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-95"
            >
              Quay lại trang đăng nhập
            </button>
          </div>
        ) : (
          /* Giao diện khi đang xử lý (Loading) */
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-14 w-14 animate-spin rounded-full border-b-4 border-t-4 border-blue-500"></div>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Đang xác thực tài khoản...
            </h2>
            <p className="italic text-gray-500">Vui lòng đợi trong giây lát!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
