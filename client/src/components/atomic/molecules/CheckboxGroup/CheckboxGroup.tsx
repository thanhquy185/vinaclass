import { Checkbox } from "@/components/atomic/atoms/Checkbox/Checkbox";
import type { Option } from "@/shared/types";
import { useEffect, useState } from "react";

interface CheckboxGroupProps {
  options: Option[];
  value?: (string | number)[]; // IDs selected from the API.
  onChange?: (selectedValues: (string | number)[]) => void;
  disabled?: boolean;
}

export const CheckboxGroup = ({
  options,
  value = [],
  onChange,
  disabled = false,
}: CheckboxGroupProps) => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>(value);

  // Synchronize when the value received from API props changes.
  useEffect(() => {
    setSelectedIds(value);
  }, [value]);

  const isAllSelected =
    options.length > 0 && selectedIds.length === options.length;

  const handleSelectAll = () => {
    if (disabled) return;
    const nextIds = isAllSelected ? [] : options.map((opt) => opt.value);
    setSelectedIds(nextIds);
    onChange?.(nextIds);
  };

  const handleSelectItem = (id: number | string) => {
    if (disabled) return;
    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    setSelectedIds(nextIds);
    onChange?.(nextIds);
  };

  return (
    <div
      className={`flex flex-col px-5 pb-2 text-text-secondary ${disabled ? "pointer-events-none opacity-75" : ""}`}
    >
      {/* Select-all button. */}
      <div className="p-4">
        <Checkbox
          label="Chọn tất cả"
          checked={isAllSelected}
          onChange={handleSelectAll}
          disabled={disabled}
        />
      </div>

      {/* Group list. */}
      <div className="flex flex-wrap gap-0">
        {options.map((option) => (
          <div key={option.value} className="p-4">
            <Checkbox
              label={option.label}
              checked={selectedIds.includes(option.value)}
              onChange={() => handleSelectItem(option.value)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
