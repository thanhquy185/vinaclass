import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PrimaryColor = "red" | "blue" | "green" | "orange" | "teal";

export const PRIMARY_COLORS: {
  key: PrimaryColor;
  label: string;
  hex: string;
}[] = [
  { key: "red", label: "Red", hex: "#fb3311" },
  { key: "blue", label: "Blue", hex: "#666cff" },
  { key: "green", label: "Green", hex: "#72e128" },
  { key: "orange", label: "Orange", hex: "#fdb528" },
  { key: "teal", label: "Teal", hex: "#26c6f9" },
];

function applyPrimaryColor(color: PrimaryColor) {
  if (typeof window === "undefined") return;
  if (color === "red") {
    document.documentElement.removeAttribute("data-primary");
  } else {
    document.documentElement.setAttribute("data-primary", color);
  }
}

interface ThemeState {
  isDarkMode: boolean;
  primaryColor: PrimaryColor;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      primaryColor: "red",
      toggleTheme: () =>
        set((state) => {
          const newMode = !state.isDarkMode;
          if (typeof window !== "undefined") {
            document.documentElement.classList.toggle("dark", newMode);
          }
          return { isDarkMode: newMode };
        }),
      setTheme: (isDark) => {
        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle("dark", isDark);
        }
        set({ isDarkMode: isDark });
      },
      setPrimaryColor: (color) => {
        applyPrimaryColor(color);
        set({ primaryColor: color });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);
