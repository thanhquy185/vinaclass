import { Checkbox as AntCheckbox } from "antd";
import type { CheckboxChangeEvent, CheckboxRef } from "antd";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  onChange?: (event: CheckboxChangeEvent) => void;
  label?: string;
  classNameLabel?: string;
  classNameParent?: string;
  /** @deprecated Use classNameLabel instead. */
  classnameLabel?: string;
  /** @deprecated Use classNameParent instead. */
  classnameParent?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      id,
      className,
      classNameLabel,
      classNameParent,
      classnameLabel = "",
      classnameParent = "",
      onChange,
      ...props
    },
    ref
  ) => {
    const setInputRef = (instance: CheckboxRef | null) => {
      const inputElement = instance?.input ?? null;

      if (typeof ref === "function") {
        ref(inputElement);
      } else if (ref) {
        ref.current = inputElement;
      }
    };

    return (
      <AntCheckbox
        ref={setInputRef}
        id={id}
        className={cn(
          "vinaclass-checkbox flex cursor-pointer items-center",
          className,
          classNameParent ?? classnameParent
        )}
        classNames={{
          icon: "vinaclass-checkbox-icon",
        }}
        onChange={onChange}
        {...props}
      >
        {label && (
          <span
            className={cn(
              "text-body-2 select-none text-text-primary",
              classNameLabel ?? classnameLabel
            )}
          >
            {label}
          </span>
        )}
      </AntCheckbox>
    );
  }
);
