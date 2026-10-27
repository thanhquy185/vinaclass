import { Radio } from "antd";
import type { ReactNode } from "react";
import type { FormItemProps, Rule } from "antd/es/form";
import type { RadioGroupProps } from "antd/es/radio";
import { AdminFormField } from "@/shared/components/admin/AdminFormField";

export interface AdminRadioGroupFieldProps {
  label: ReactNode;
  name?: FormItemProps["name"];
  rules?: Rule[];
  required?: FormItemProps["required"];
  options: NonNullable<RadioGroupProps["options"]>;
  disabled?: boolean;
}

export function AdminRadioGroupField({
  label,
  name,
  rules,
  required,
  options,
  disabled,
}: AdminRadioGroupFieldProps) {
  return (
    <AdminFormField label={label} name={name} rules={rules} required={required}>
      <Radio.Group
        aria-label={typeof label === "string" ? label : undefined}
        options={options}
        disabled={disabled}
        className="flex min-h-6 items-center gap-4"
      />
    </AdminFormField>
  );
}
