import googleLoginService from "@/features/auth/api/google-auth.service";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEntityMutation } from "@/hooks/shared/useEntityMutation";
import { authService } from "@/features/auth/api/auth.service";
import type { LoginResponse } from "@/shared/types";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import { useTranslation } from "react-i18next";

const GOOGLE_ERROR_TRANSLATION_KEYS: Record<string, string> = {
  unauthorized_domain: "googleAuth.errors.unauthorizedDomain",
  account_inactive: "googleAuth.errors.accountInactive",
  email_not_found: "googleAuth.errors.emailNotFound",
  email_not_verified: "googleAuth.errors.emailNotVerified",
  login_failed: "googleAuth.errors.loginFailed",
  google_auth_error: "googleAuth.errors.connectionFailed",
};

export const useGoogleAuth = () => {
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setAuth, setToken } = useAuthStore();

  // Fetch the current user after the Google callback provides a token.
  const { mutate: fetchCurrentUser, isPending } = useEntityMutation({
    mutationFn: authService.me,
    onSuccess: (data: LoginResponse) => {
      setAuth(data.me, data.role, useAuthStore.getState().token ?? "");
      const roleCode = getAuthenticatedUserRoleCode(data.me, data.role);
      if (roleCode === "STUDENT" || roleCode === "TEACHER") {
        navigate("/courses");
      } else {
        navigate("/dashboard");
      }
    },
    onError: () => {
      setErrorKey("googleAuth.errors.currentUserFailed");
    },
  });

  const loginWithGoogle = () => {
    try {
      googleLoginService.redirectToGoogle();
    } catch {
      setErrorKey("googleAuth.errors.connectionFailed");
    }
  };

  const registerWithGoogle = () => {
    try {
      googleLoginService.redirectToGoogle("register");
    } catch {
      setErrorKey("googleAuth.errors.connectionFailed");
    }
  };

  const handleGoogleCallback = useCallback(async () => {
    const authData = googleLoginService.extractDataFromUrl(searchParams);
    if (authData?.error) {
      setErrorKey(
        GOOGLE_ERROR_TRANSLATION_KEYS[authData.error] ??
          "googleAuth.errors.unknown"
      );
    } else if (authData?.accessToken) {
      window.history.replaceState(
        null,
        document.title,
        `${window.location.pathname}${window.location.search}`
      );
      setToken(authData.accessToken);
      fetchCurrentUser();
    } else {
      setErrorKey("googleAuth.errors.missingCallback");
    }
  }, [searchParams, setToken, fetchCurrentUser]);

  return {
    loginWithGoogle,
    registerWithGoogle,
    handleGoogleCallback,
    isLoading: isPending,
    error: errorKey ? t(errorKey) : null,
  };
};
