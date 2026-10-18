import {
  PRIMARY_COLORS,
  useThemeStore,
  type PrimaryColor,
} from "@/stores/theme.store";

export default function ColorPicker() {
  const { primaryColor, setPrimaryColor } = useThemeStore();

  return (
    <div className="flex items-center gap-2">
      {PRIMARY_COLORS.map(({ key, label, hex }) => (
        <button
          key={key}
          title={label}
          onClick={() => setPrimaryColor(key as PrimaryColor)}
          className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
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
