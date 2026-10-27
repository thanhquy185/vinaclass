import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  message: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: null,

  startLoading: (message = "Đang xử lý...") =>
    set({ isLoading: true, message }),

  stopLoading: () => set({ isLoading: false, message: null }),
}));
