import React, { forwardRef } from "react";
import Button from "../Button/Button";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  hasBoder?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = "", hasBoder, ...props }, ref) => {
    return (
      <div
        className={`flex w-full items-center gap-1 rounded-md border border-other-outlined-border bg-background-body-background px-3 ${
          hasBoder ? "!border-other-input-border" : ""
        } ${className}`}
      >
        {icon && (
          <Button size={"small"} className="text-text-disabled">
            {icon}
          </Button>
        )}

        <input
          ref={ref}
          {...props}
          className="h-10 w-full bg-transparent text-text-primary outline-none placeholder:text-text-disabled"
        />
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
