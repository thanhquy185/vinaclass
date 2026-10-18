import type { AuthResponse } from "@/types";

const BACKEND_URL = import.meta.env.VITE_WEB_URL || "http://localhost:8000";

const googleLoginService = {
  redirectToGoogle: (): void => {
    const frontendBaseUrl = window.location.origin;
    const callbackUrl = `${frontendBaseUrl}/auth/callback`;
    window.location.href = `${BACKEND_URL}/auth/google/redirect?redirect_url=${encodeURIComponent(callbackUrl)}`;
  },

  // dùng search param để lấy token trên url
  extractDataFromUrl: (searchParams: URLSearchParams): AuthResponse | null => {
    const access_token = searchParams.get("token");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const responseError = searchParams.get("error");
    let error = null;
    if (responseError) {
      const errorMessages: Record<string, string> = {
        unauthorized_domain:
          "Tài khoản của bạn không thuộc quyền quản lý của chúng tôi.",
        email_not_found: "Không tìm thấy email từ Google.",
        login_failed: "Đăng nhập thất bại, vui lòng thử lại.",
        google_auth_error: "Lỗi kết nối với Google.",
      };

      error = errorMessages[responseError] || "Đã có lỗi xảy ra";
    }
    if (error) {
      return {
        accessToken: "",
        user: { username: null, email: null },
        error: error,
      };
    }

    if (access_token) {
      return {
        accessToken,
        user: { username, email },
        error: error!,
      };
    }
    return null;
  },
};

export default googleLoginService;
