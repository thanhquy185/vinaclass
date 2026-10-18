import { create } from "zustand";

interface EditorState {
  content: string;
  setContent: (content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  content: "<p>Chào mừng bạn đến với project!</p>",
  setContent: (content) => set({ content }),
}));
