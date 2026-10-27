import { Input } from "antd";
import type { ChangeEventHandler, ReactNode } from "react";
import type { FormItemProps, Rule } from "antd/es/form";
import { AdminFormField } from "@/shared/components/admin/AdminFormField";
import { cn } from "@/shared/utils/cn";

export interface AdminTextFieldProps {
  label: ReactNode;
  name?: FormItemProps["name"];
  dependencies?: FormItemProps["dependencies"];
  rules?: Rule[];
  required?: FormItemProps["required"];
  fieldClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  type?: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function AdminTextField({
  label,
  name,
  dependencies,
  rules,
  required,
  fieldClassName,
  type = "text",
  autoComplete,
  autoFocus,
  ...inputProps
}: AdminTextFieldProps) {
  const sharedInputProps = {
    ...inputProps,
    autoFocus,
    "aria-label": typeof label === "string" ? label : undefined,
    autoComplete: autoComplete ?? "off",
    size: "large" as const,
    variant: "outlined" as const,
    className: cn(
      "!h-10 !w-full !rounded-lg !bg-background-paper !px-3 !text-sm !text-text-primary placeholder:!text-text-disabled",
      inputProps.disabled &&
        "!cursor-not-allowed !bg-action-hover !text-text-disabled",
    ),
  };

  return (
    <AdminFormField
      label={label}
      name={name}
      dependencies={dependencies}
      rules={rules}
      required={required}
      className={fieldClassName}
    >
      {type === "password" ? (
        <Input.Password
          {...sharedInputProps}
          autoComplete={autoComplete ?? "new-password"}
          visibilityToggle
        />
      ) : (
        <Input {...sharedInputProps} type={type} />
      )}
    </AdminFormField>
  );
}
