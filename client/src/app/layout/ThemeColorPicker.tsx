import {
  PRIMARY_COLORS,
  useThemeStore,
  type PrimaryColor,
} from "@/shared/stores/useThemeStore";

export default function ColorPicker() {
  const { primaryColor, setPrimaryColor } = useThemeStore();

  return (
    <div className="flex items-center gap-2">
      {PRIMARY_COLORS.map(({ key, label, hex }) => (
        <button
          key={key}
          type="button"
          aria-label={`${label} theme color`}
          aria-pressed={primaryColor === key}
          title={label}
          onClick={() => setPrimaryColor(key as PrimaryColor)}
          className="h-5 w-5 shrink-0 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-main"
          style={{
            backgroundColor: hex,
            borderColor: primaryColor === key ? hex : "transparent",
            outline: primaryColor === key ? `2px solid ${hex}` : "none",
            outlineOffset: "2px",
          }}
        />
      ))}
    </div>
  );
}
