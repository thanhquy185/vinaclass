import { Radio as AntRadio } from "antd";
import type { RadioChangeEvent, RadioRef } from "antd";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export interface RadioButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size" | "type"
> {
  onChange?: (event: RadioChangeEvent) => void;
  label?: string;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, id, className, onChange, ...props }, ref) => {
    const setInputRef = (instance: RadioRef | null) => {
      const inputElement = instance?.input ?? null;

      if (typeof ref === "function") {
        ref(inputElement);
      } else if (ref) {
        ref.current = inputElement;
      }
    };

    return (
      <AntRadio
        ref={setInputRef}
        id={id}
        className={cn("!mr-0", className)}
        onChange={onChange}
        styles={{ label: { paddingInlineEnd: 0 } }}
        {...props}
      >
        {label && (
          <span className="text-body-2 cursor-pointer select-none text-text-primary">
            {label}
          </span>
        )}
      </AntRadio>
    );
  }
);

RadioButton.displayName = "RadioButton";
