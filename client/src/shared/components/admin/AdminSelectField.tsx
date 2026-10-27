import { Select, type SelectProps } from "antd";
import type { ReactNode } from "react";
import type { FormItemProps, Rule } from "antd/es/form";
import { AdminFormField } from "@/shared/components/admin/AdminFormField";

export interface AdminSelectFieldProps {
  label: ReactNode;
  name?: FormItemProps["name"];
  rules?: Rule[];
  required?: FormItemProps["required"];
  options?: SelectProps["options"];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  optionFilterProp?: string;
  mode?: SelectProps["mode"];
}

export function AdminSelectField({
  label,
  name,
  rules,
  required,
  options,
  placeholder,
  disabled,
  loading,
  allowClear,
  showSearch,
  optionFilterProp,
  mode,
}: AdminSelectFieldProps) {
  return (
    <AdminFormField label={label} name={name} rules={rules} required={required}>
      <Select
        aria-label={typeof label === "string" ? label : undefined}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        allowClear={allowClear}
        showSearch={showSearch}
        optionFilterProp={optionFilterProp}
        mode={mode}
        variant="outlined"
        size="large"
        className="w-full [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-background-paper [&_.ant-select-selector]:!px-3"
      />
    </AdminFormField>
  );
}
