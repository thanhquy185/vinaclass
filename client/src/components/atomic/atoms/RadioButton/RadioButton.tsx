import { forwardRef, type InputHTMLAttributes } from "react";

interface RadioButtonProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, id, ...props }, ref) => {
    return (
      <div className="flex cursor-pointer items-center gap-2">
        <input
          ref={ref}
          type="radio"
          id={id}
          className="peer h-4 w-4 cursor-pointer accent-primary-main"
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className="text-body-2 cursor-pointer text-text-primary"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

RadioButton.displayName = "RadioButton";
