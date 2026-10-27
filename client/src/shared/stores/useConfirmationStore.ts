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
  // Open the confirmation dialog from a page or action handler.
  openConfirm: (options: ConfirmOptions) => void;
  // Internal actions used by the global confirmation dialog.
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
