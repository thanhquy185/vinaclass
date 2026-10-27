import type { AuthResponse } from "@/shared/types";
import { environment } from "@/shared/config/environment";

const googleLoginService = {
  redirectToGoogle: (intent: "login" | "register" = "login"): void => {
    const frontendBaseUrl = window.location.origin;
    const callbackUrl = `${frontendBaseUrl}/auth/callback`;
    const params = new URLSearchParams({ redirect_url: callbackUrl });
    if (intent === "register") params.set("intent", "register");
    window.location.href = `${environment.webBaseUrl}/auth/google/redirect?${params.toString()}`;
  },

  // Read callback values from the query string or URL fragment.
  extractDataFromUrl: (searchParams: URLSearchParams): AuthResponse | null => {
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );
    const accessToken = hashParams.get("token") || searchParams.get("token");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const responseError = searchParams.get("error");

    if (responseError) {
      return {
        accessToken: "",
        user: { username: null, email: null },
        error: responseError,
      };
    }

    if (accessToken) {
      return {
        accessToken,
        user: { username, email },
      };
    }
    return null;
  },
};

export default googleLoginService;
