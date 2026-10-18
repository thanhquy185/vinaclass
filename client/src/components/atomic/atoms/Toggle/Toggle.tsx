import { cn } from "@/utils/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface ToggleProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, id, disabled, className, checked, onChange, ...props }, ref) => {
    const internalId =
      id || `toggle-${label?.replace(/\s+/g, "-").toLowerCase()}`;

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 py-1",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {label && (
          <label
            htmlFor={internalId}
            className="text-body-2 cursor-pointer select-none text-text-secondary"
          >
            {label}
          </label>
        )}

        <label
          className={cn(
            "relative inline-flex items-center",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={internalId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />

          {/* Đường ray (Track) */}
          <div className="peer-checked:bg-primary-main/30 h-4 w-9 rounded-full bg-other-outlined-border transition-colors duration-200" />

          {/* Nút tròn (Thumb) */}
          <div className="absolute left-0 h-5 w-5 rounded-full border border-other-outlined-border bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4 peer-checked:border-primary-main peer-checked:bg-primary-main" />
        </label>
      </div>
    );
  }
);

Toggle.displayName = "Toggle";
