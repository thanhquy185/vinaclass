import type { RoleResponse, User, UserProfileData } from "@/shared/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  role: RoleResponse | null;
  setAuth: (user: User, role: RoleResponse | null, token: string) => void;
  setToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
};

type PersistedUser = Omit<Partial<User>, "profile"> & {
  profile?: Partial<UserProfileData> | null;
  fullName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  isFemale?: boolean | null;
  avatarUrl?: string | null;
};

type PersistedAuthState = Omit<Partial<AuthState>, "user"> & {
  user?: PersistedUser | null;
};

const migratePersistedAuthState = (persistedState: unknown): AuthState => {
  if (!persistedState || typeof persistedState !== "object") {
    return {} as AuthState;
  }

  const state = persistedState as PersistedAuthState;
  const persistedUser = state.user;
  if (!persistedUser) return state as AuthState;

  const {
    fullName,
    phone,
    dateOfBirth,
    isFemale,
    avatarUrl,
    profile,
    ...user
  } = persistedUser;

  return {
    ...state,
    user: {
      ...user,
      profile: {
        fullName: profile?.fullName ?? fullName ?? "",
        phone: profile?.phone ?? phone ?? null,
        dateOfBirth: profile?.dateOfBirth ?? dateOfBirth ?? null,
        isFemale: profile?.isFemale ?? isFemale ?? false,
        avatarUrl: profile?.avatarUrl ?? avatarUrl ?? null,
      },
    } as User,
  } as AuthState;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,

      setAuth: (user, role, token) =>
        set({
          token,
          user,
          role,
          isAuthenticated: true,
        }),

      setToken: (token) => set({ token }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () => {
        set({
          token: null,
          user: null,
          role: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("auth-storage");
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: migratePersistedAuthState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migratePersistedAuthState(persistedState),
      }),
    }
  )
);
