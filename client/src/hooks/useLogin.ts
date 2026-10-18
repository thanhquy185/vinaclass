import { authService } from "@/services/api/login.service";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import Cookies from "js-cookie";
import type { LoginResponse } from "@/types";

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: LoginResponse) => {
      setAuth(data.original.me, data.original.role);
      Cookies.set("token", data.original.accessToken, {
        expires: 7, // 7 ngày
      });
    },
  });
  return {
    login: mutation.mutate, // gọi bình thường
    loginAsync: mutation.mutateAsync, // dùng await nếu cần
    isLoadingLogin: mutation.isPending,
    isLoginError: mutation.isError,
    isLoginSuccess: mutation.isSuccess,
  };
};
