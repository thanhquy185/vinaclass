import { useEntityMutation } from "@/hooks/shared/useEntityMutation";
import {
  authService,
  type RegisterStudentInput,
} from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { LoginResponse } from "@/shared/types";

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const mutation = useEntityMutation({
    mutationFn: (input: RegisterStudentInput) =>
      authService.registerStudent(input),
    notifications: {
      success: "Tài khoản sinh viên đã được tạo thành công.",
    },
    onSuccess: (response: LoginResponse) => {
      setAuth(response.me, response.role, response.accessToken);
    },
  });

  return {
    registerStudent: mutation.mutateAsync,
    isRegistering: mutation.isPending,
  };
}
