import { create } from "zustand";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastMessage["type"]) => void;
  hideToast: (id: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, type) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
  },
  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
