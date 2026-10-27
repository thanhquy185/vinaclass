import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useId } from "react";
import { cn } from "@/shared/utils/cn";

export interface DateTimePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  label?: string;
  placeHolder?: string;
  classNameParent?: string;
  disabled?: boolean;
}

export const DateTimePicker = ({
  selected,
  onSelect,
  label,
  placeHolder,
  classNameParent,
  disabled = false,
}: DateTimePickerProps) => {
  const inputId = useId();
  const selectedValue =
    selected instanceof Date && Number.isFinite(selected.getTime())
      ? dayjs(selected).second(0).millisecond(0)
      : null;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1 text-text-secondary",
        classNameParent,
      )}
    >
      {label && (
        <label htmlFor={inputId} className="text-input-text font-medium">
          {label}
        </label>
      )}

      <DatePicker
        id={inputId}
        value={selectedValue}
        onChange={(value) => onSelect(value?.second(0).millisecond(0).toDate())}
        format="DD/MM/YYYY HH:mm"
        showTime={{
          format: "HH:mm",
          defaultOpenValue: dayjs().startOf("day").hour(12),
          showNow: false,
        }}
        allowClear
        disabled={disabled}
        placeholder={placeHolder}
        size="large"
        variant="outlined"
        className="!h-10 !w-full !rounded-lg !bg-background-paper !px-3 !text-sm !text-text-primary"
      />
    </div>
  );
};
