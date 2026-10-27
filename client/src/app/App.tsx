import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useThemeStore } from "@/shared/stores/useThemeStore";
import { GlobalOverlays } from "@/app/providers/GlobalOverlays";

export default function App() {
  useEffect(() => {
    const { isDarkMode, primaryColor } = useThemeStore.getState();
    document.documentElement.classList.toggle("dark", isDarkMode);
    if (primaryColor === "red") {
      document.documentElement.removeAttribute("data-primary");
    } else {
      document.documentElement.setAttribute("data-primary", primaryColor);
    }
  }, []);

  return (
    <>
      <Outlet />
      <GlobalOverlays />
    </>
  );
}
