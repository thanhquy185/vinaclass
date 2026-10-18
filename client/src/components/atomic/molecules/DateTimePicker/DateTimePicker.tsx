import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Input from "../../atoms/Input/Input";
import { formatFullDateTimeVN } from "@/utils";
import TimePicker from "../TimePicker/TimePicker";
import { vi } from "react-day-picker/locale";

interface DateTimePickerProps {
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
  const [isOpen, setIsOpen] = useState(false);

  // Xử lý thay đổi giờ
  const handleTimeChange = (h: number, m: number) => {
    if (disabled) return;
    const newDate = selected ? new Date(selected) : new Date();
    newDate.setHours(h, m, 0, 0);
    onSelect(newDate);
  };

  // Xử lý chọn ngày từ DayPicker
  const handleDaySelect = (date: Date | undefined) => {
    if (disabled || !date) {
      if (!disabled) onSelect(undefined);
      return;
    }

    const newDate = new Date(date);
    if (selected) {
      // Nếu đã có ngày/giờ trước đó, giữ nguyên giờ cũ
      newDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else {
      // Nếu là lần đầu chọn ngày, mặc định 12:00
      newDate.setHours(12, 0, 0, 0);
    }

    onSelect(newDate);
  };

  return (
    <div
      className={`relative flex w-full flex-col gap-1 text-text-secondary ${classNameParent}`}
    >
      {label && <div className="text-input-text font-medium">{label}</div>}

      <Input
        readOnly
        disabled={disabled}
        value={selected ? formatFullDateTimeVN(selected.toISOString()) : ""}
        onClick={() => setIsOpen(!isOpen)}
        placeholder={placeHolder}
        className="w-full cursor-pointer"
        // Thêm icon lịch nếu cần (tùy vào component Input của bạn)
        // icon={<Calendar size={18} />}
      />

      {isOpen && (
        <>
          {/* Lớp phủ (Backdrop) ẩn để click ra ngoài thì đóng bảng */}
          <div
            className="fixed inset-0 z-40 h-screen w-screen"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute top-full z-50 mt-2 w-fit rounded-lg border border-other-outlined-border bg-white p-4 shadow-xl duration-200 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện nổi bọt làm đóng bảng khi thao tác bên trong
          >
            <DayPicker
              locale={vi}
              mode="single"
              selected={selected}
              onSelect={handleDaySelect}
              // Có thể thêm modifiers để hiển thị đẹp hơn
              className="m-0"
            />

            {/* 2. Chọn Giờ (Molecule tự viết) */}
            <TimePicker selected={selected} onChange={handleTimeChange} />
          </div>
        </>
      )}
    </div>
  );
};
