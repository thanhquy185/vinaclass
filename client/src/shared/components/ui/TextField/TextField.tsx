import { forwardRef, useId, useState } from "react";
import Input from "../Input/Input";
import type { InputProps } from "../Input/Input";
import { Eye, EyeOff } from "lucide-react";
import Button from "../Button/Button";

export interface TextFieldProps extends InputProps {
  label?: string;
  error?: string;
  classNameParent?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      placeholder = "",
      classNameParent = "",
      type,
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ");

    const isPasswordType = type === "password";

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div
        className={`flex flex-col gap-1 text-text-primary ${classNameParent}`}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="text-body-2-semibold text-text-secondary"
          >
            {label}
          </label>
        )}

        <div className="relative w-full">
          <Input
            ref={ref}
            id={inputId}
            placeholder={placeholder}
            type={isPasswordType && showPassword ? "text" : type}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={describedBy || undefined}
            className={`${isPasswordType ? "pr-10" : ""} ${props.className || ""}`}
            {...props}
          />

          {isPasswordType && (
            <Button
              type="button"
              size={"small"}
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled transition-colors hover:text-text-secondary"
              tabIndex={-1}
            >
              {showPassword ? (
                <Eye size={20} strokeWidth={1.5} />
              ) : (
                <EyeOff size={20} strokeWidth={1.5} />
              )}
            </Button>
          )}
        </div>

        {error && (
          <span
            id={errorId}
            className="text-caption mt-0.5 text-alert-error-content"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
