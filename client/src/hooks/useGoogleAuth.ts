import googleLoginService from "@/services/external/googleLogin.service";
import { useAuthStore } from "@/stores/auth.store";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/api/login.service";
import type { LoginResponse } from "@/types";

interface SetCookieResponse {
  success: boolean;
  message: string;
}

export const useGoogleAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Sử dụng Mutation để lấy thông tin User ngay sau khi có token
  const meMutation = useMutation({
    mutationFn: authService.me,
    onSuccess: (data: LoginResponse) => {
      setAuth(data.original.me, data.original.role);
      if (data.original.me.isStudent) {
        navigate("/courses");
      } else if (data.original.role.id === 2) {
        navigate("/course-group");
      } else {
        navigate("/dashboard");
      }
    },
    onError: () => {
      setError("Lỗi khi lấy thông tin người dùng.");
    },
  });

  const setCookie = useMutation({
    mutationFn: authService.setCookie,
    onSuccess: (data: SetCookieResponse) => {
      console.log(data);
    },
    onError: () => {
      setError("Lỗi khi lấy thông tin người dùng.");
    },
  });

  const loginWithGoogle = () => {
    try {
      googleLoginService.redirectToGoogle();
    } catch (e) {
      console.error(e);
      setError("Không thể kết nối với hệ thống đăng nhập.");
    }
  };

  const handleGoogleCallback = async () => {
    const authData = googleLoginService.extractDataFromUrl(searchParams);
    if (authData?.error) {
      setError(authData?.error);
    } else if (authData?.accessToken) {
      await setCookie.mutateAsync({ access_token: authData.accessToken });
      meMutation.mutate();
    } else {
      setError("Không tìm thấy thông tin đăng nhập từ Google.");
    }
  };

  return {
    loginWithGoogle,
    handleGoogleCallback,
    // Dùng luôn trạng thái của mutation để hiển thị loading ở UI
    isLoading: meMutation.isPending,
    error: error,
  };
};
