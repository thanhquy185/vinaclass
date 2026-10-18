import { useState } from "react";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { cn } from "@/utils/cn";
import type { Option } from "@/types";

interface SelectFieldProps {
  label?: string;
  placeholder: string;
  options: Option[];
  onSelect: (value: number | string) => void;
  classname?: string;
  defaultIndex?: number;
  // Bổ sung value để nhận giá trị mặc định từ API
  value?: number;
  disabled?: boolean; // Thêm disabled cho mode View
}

export default function SelectField({
  label,
  placeholder,
  options,
  onSelect,
  classname,
  value, // Giá trị từ API
  disabled,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userSelection, setUserSelection] = useState<Option | null>(null);

  // LOGIC MỚI:
  // 1. Ưu tiên user tự chọn tay
  // 2. Nếu không, tìm trong options cái nào có value trùng với prop value
  // 3. Nếu không thấy, mới dùng placeholder
  const selectedOption =
    userSelection ?? options.find((opt) => opt.value === value) ?? null;

  const handleOptionClick = (option: Option) => {
    if (disabled) return;
    setUserSelection(option);
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "group relative flex min-w-[150px] flex-1 flex-col rounded-md border border-other-outlined-border",
        disabled &&
          "bg-action-disabledBackground pointer-events-none opacity-70", // Xử lý mode View
        classname
      )}
      onMouseEnter={() => !disabled && setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {label && (
        <span
          className={cn(
            "absolute left-2 top-[-10px] z-10 bg-background-body-background px-1 text-[12px] font-medium transition-colors",
            isOpen ? "text-primary-main" : "text-text-secondary"
          )}
        >
          {label}
        </span>
      )}

      <Button
        variant="text"
        className="!w-full items-center justify-between bg-background-body-background px-3 py-2.5"
        disabled={disabled}
      >
        <span
          className={cn(
            "block flex-1 truncate text-left text-[14px]",
            selectedOption ? "text-text-primary" : "text-text-secondary"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon
          name="arrowDown"
          size={20}
          className={cn(
            "ml-2 flex-shrink-0 text-text-secondary transition-transform duration-200",
            isOpen && "rotate-180 text-primary-main" // Xoay icon cho "xịn"
          )}
        />
      </Button>

      {/* DROPDOWN MENU */}
      {isOpen && !disabled && (
        <>
          {/* Invisible Bridge: Lớp đệm vô hình để nối liền button và menu, chống bug hover */}
          <div className="absolute left-0 top-full h-[6px] w-full" />

          <ul className="absolute left-[-1px] top-[calc(100%+4px)] z-50 max-h-60 w-[calc(100%+2px)] overflow-y-auto rounded-md border border-other-outlined-border bg-background-body-background shadow-lg animate-in fade-in zoom-in-95">
            {options.length > 0 ? (
              options.map((opt, index) => (
                <li
                  key={index}
                  onClick={() => handleOptionClick(opt)}
                  className={cn(
                    "cursor-pointer px-4 py-3 text-[14px] transition-colors hover:bg-action-hover",
                    selectedOption?.value === opt.value
                      ? "bg-action-selected font-medium text-primary-main"
                      : "text-text-primary"
                  )}
                >
                  <span className="block truncate">{opt.label}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-center text-[14px] italic text-text-disabled">
                Không có dữ liệu
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
