import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useThemeStore } from "./stores/theme.store";
import { ToastContainer } from "./components/atomic/molecules/ToastContainer/ToastContainer";
import { LoadingGlobal } from "./components/atomic/molecules/Loading/Loading";
import { ConfirmationGlobal } from "./components/global/ConfirmationGlobal";

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
      <ToastContainer />
      <LoadingGlobal />
      <ConfirmationGlobal />
    </>
  );
}
