import type { RoleResponse, User } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthState = {
  // token: string | null; đổi sang cookie
  user: User | null;
  isAuthenticated: boolean;
  role: RoleResponse | null;
  // Actions
  setAuth: (user: User, role: RoleResponse) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,

      // Đăng nhập thành công: Lưu user
      setAuth: (user, role) =>
        set({
          user,
          role,
          isAuthenticated: true,
        }),

      // Cập nhật thông tin cá nhân (ví dụ: đổi avatar, đổi tên)
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      // Đăng xuất: Xóa sạch dấu vết
      logout: () => {
        set({
          user: null,
          role: null,
          isAuthenticated: false,
        });
        // Có thể bổ sung điều hướng về trang Login ở đây nếu không dùng router
        localStorage.removeItem("auth-storage");
      },
    }),

    {
      name: "auth-storage", // Tên key trong LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
