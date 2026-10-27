import { Input as AntInput } from "antd";
import type { InputRef } from "antd";
import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  hasBorder?: boolean;
  /** @deprecated Use hasBorder instead. */
  hasBoder?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { icon, className = "", hasBorder, hasBoder, size: _size, ...props },
    ref
  ) => {
    const setInputRef = (instance: InputRef | null) => {
      const inputElement = instance?.input ?? null;

      if (typeof ref === "function") {
        ref(inputElement);
      } else if (ref) {
        ref.current = inputElement;
      }
    };

    return (
      <div
        className={`flex w-full items-center gap-1 rounded-md border border-other-outlined-border bg-background-body-background px-3 ${
          (hasBorder ?? hasBoder) ? "!border-other-input-border" : ""
        } ${className}`}
      >
        <AntInput
          ref={setInputRef}
          {...props}
          htmlSize={_size}
          prefix={
            icon ? (
              <span className="text-text-disabled">{icon}</span>
            ) : undefined
          }
          variant="borderless"
          className="h-10 w-full bg-transparent px-0 text-text-primary shadow-none placeholder:text-text-disabled"
        />
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
