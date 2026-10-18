import { useThemeStore } from "@/stores/theme.store";
import { Button } from "../../atoms";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <Button className="hover:bg-action-hover" onClick={toggleTheme}>
      {isDarkMode ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
