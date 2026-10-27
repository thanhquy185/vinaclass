import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactNode } from "react";
import type { FormItemProps, Rule } from "antd/es/form";
import { AdminFormField } from "@/shared/components/admin/AdminFormField";

export interface AdminDateFieldProps {
  label: ReactNode;
  name?: FormItemProps["name"];
  rules?: Rule[];
  required?: FormItemProps["required"];
  disabled?: boolean;
  placeholder?: string;
  displayFormat?: string;
  valueFormat?: string;
}

export function AdminDateField({
  label,
  name,
  rules,
  required,
  disabled,
  placeholder,
  displayFormat = "DD/MM/YYYY",
  valueFormat = "YYYY-MM-DD",
}: AdminDateFieldProps) {
  return (
    <AdminFormField
      label={label}
      name={name}
      rules={rules}
      required={required}
      getValueProps={(value: string | null | undefined) => ({
        value: value ? dayjs(value) : null,
      })}
      normalize={(value: Dayjs | null) =>
        value?.isValid() ? value.format(valueFormat) : ""
      }
    >
      <DatePicker
        aria-label={typeof label === "string" ? label : undefined}
        disabled={disabled}
        format={displayFormat}
        placeholder={placeholder ?? displayFormat.toLowerCase()}
        size="large"
        variant="outlined"
        className="!h-10 !w-full !rounded-lg !bg-background-paper !px-3 !text-sm !text-text-primary"
      />
    </AdminFormField>
  );
}
