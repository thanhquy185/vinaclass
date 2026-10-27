import { Select } from "antd";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminFilterField } from "@/shared/components/admin/AdminFilterField";
import type { Option } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

export interface SelectFieldProps {
  label?: string;
  placeholder: string;
  options: Option[];
  onSelect: (value: number | string) => void;
  className?: string;
  /** @deprecated Use className instead. */
  classname?: string;
  value?: number | string;
  disabled?: boolean;
  loading?: boolean;
}

export default function SelectField({
  label,
  placeholder,
  options,
  onSelect,
  className,
  classname,
  value,
  disabled,
  loading = false,
}: SelectFieldProps) {
  const selectId = useId();
  const { t } = useTranslation("common");
  const [uncontrolledValue, setUncontrolledValue] = useState<
    number | string | undefined
  >();
  const selectedValue = value === undefined ? uncontrolledValue : value;

  const handleChange = (nextValue: number | string) => {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onSelect(nextValue);
  };

  return (
    <AdminFilterField
      label={label}
      htmlFor={selectId}
      className={cn("relative min-w-[150px] flex-1", className ?? classname)}
    >
      <Select<number | string>
        id={selectId}
        aria-label={label ?? placeholder}
        className="!h-11 w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-xl"
        size="large"
        placeholder={placeholder}
        options={options}
        value={selectedValue}
        disabled={disabled}
        loading={loading}
        notFoundContent={
          <span className="px-2 py-1 text-sm text-text-disabled">
            {t("common.noData")}
          </span>
        }
        onChange={handleChange}
      />
    </AdminFilterField>
  );
}
