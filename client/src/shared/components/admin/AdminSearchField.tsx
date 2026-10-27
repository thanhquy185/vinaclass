import { Input, Select, Space } from "antd";
import { Icon } from "@/shared/components/ui";
import { AdminFilterField } from "@/shared/components/admin/AdminFilterField";
import { cn } from "@/shared/utils/cn";

export interface AdminSearchCriterion<Value extends string = string> {
  value: Value;
  label: string;
  placeholder: string;
}

export interface AdminSearchFieldProps<Value extends string = string> {
  criteria: readonly AdminSearchCriterion<Value>[];
  searchBy: Value;
  searchTerm: string;
  criteriaLabel: string;
  label?: string;
  onSearchByChange: (value: Value) => void;
  onSearchTermChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function AdminSearchField<Value extends string = string>({
  criteria,
  searchBy,
  searchTerm,
  criteriaLabel,
  label,
  onSearchByChange,
  onSearchTermChange,
  className = "",
  disabled = false,
}: AdminSearchFieldProps<Value>) {
  const activeCriterion = criteria.find(({ value }) => value === searchBy);

  return (
    <AdminFilterField label={label} className={cn("w-full", className)}>
      <Space.Compact
        block
        className="w-full !h-11 [&_.ant-input-affix-wrapper]:!h-11 [&_.ant-input-affix-wrapper]:!rounded-l-none [&_.ant-input-affix-wrapper]:!rounded-r-xl [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-l-xl [&_.ant-select-selector]:!rounded-r-none"
      >
        <Select
          aria-label={criteriaLabel}
          className="!h-11 !w-48 shrink-0"
          size="large"
          value={searchBy}
          disabled={disabled}
          options={criteria.map(({ value, label }) => ({ value, label }))}
          onChange={(value) => onSearchByChange(value as Value)}
        />
        <Input
          allowClear
          className="!h-11 !rounded-l-none !rounded-r-xl min-w-0 flex-1"
          size="large"
          placeholder={activeCriterion?.placeholder ?? ""}
          aria-label={activeCriterion?.placeholder ?? criteriaLabel}
          prefix={<Icon name="search" className="text-text-disabled" />}
          value={searchTerm}
          disabled={disabled}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
      </Space.Compact>
    </AdminFilterField>
  );
}
