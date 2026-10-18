import { create } from "zustand";

interface ConfirmOptions {
  title?: string;
  message: string;
  type?: "danger" | "warning" | "info" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmStore {
  isOpen: boolean;
  isLoading: boolean;
  config: ConfirmOptions | null;
  // Hàm để các Page gọi
  openConfirm: (options: ConfirmOptions) => void;
  // Các hàm nội bộ để điều khiển Modal
  closeConfirm: () => void;
  setLoading: (loading: boolean) => void;
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  isOpen: false,
  isLoading: false,
  config: null,

  openConfirm: (options) => {
    set({ isOpen: true, config: options, isLoading: false });
  },

  closeConfirm: () => {
    set({ isOpen: false, config: null, isLoading: false });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
