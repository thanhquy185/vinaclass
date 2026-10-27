import { authService } from "@/features/auth/api/auth.service";
import { useEntityMutation } from "@/hooks/shared/useEntityMutation";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { LoginResponse } from "@/shared/types";

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  const mutation = useEntityMutation({
    mutationFn: authService.login,
    onSuccess: (data: LoginResponse) => {
      setAuth(data.me, data.role, data.accessToken);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoadingLogin: mutation.isPending,
    isLoginError: mutation.isError,
    isLoginSuccess: mutation.isSuccess,
  };
};
