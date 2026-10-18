import { useState, useRef } from "react";
import { MultiSelectInput } from "../../molecules/MultiSelectInput/MultiSelectInput";

const MOCK_CHAPTERS = [
  { id: 1, name: "Chương 1: Cơ bản về PHP" },
  { id: 2, name: "Chương 2: Biến và kiểu dữ liệu" },
  { id: 3, name: "Chương 3: Câu lệnh điều khiển" },
  { id: 4, name: "Chương 4: Vòng lặp" },
  { id: 5, name: "Chương 5: Mảng" },
  { id: 6, name: "Chương 6: Hàm" },
];

export const ChapterMultiSelect = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([2, 3, 4]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItems = MOCK_CHAPTERS.filter((c) => selectedIds.includes(c.id));

  // Logic: Không hiện những cái đã chọn và lọc theo input
  const filteredOptions = MOCK_CHAPTERS.filter(
    (c) =>
      !selectedIds.includes(c.id) &&
      c.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setInputValue("");
  };

  return (
    <div className="relative w-full font-sans" ref={containerRef}>
      <label className="text-body-1 pb-2 text-text-secondary">Chương</label>

      <MultiSelectInput
        selectedItems={selectedItems}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onRemoveItem={(id) =>
          setSelectedIds((prev) => prev.filter((i) => i !== id))
        }
        onFocus={() => setIsOpen(true)}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-md border border-other-outlined-border bg-background-body-background shadow-xl">
          {/* Những item ĐÃ CHỌN (hiển thị màu xám như trong ảnh) */}
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="text-body-2 cursor-not-allowed border-b border-other-outlined-border bg-action-hover px-4 py-2 text-text-secondary last:border-0"
            >
              {item.name}
            </li>
          ))}

          {/* Những item CHƯA CHỌN */}
          {filteredOptions.map((option) => (
            <li
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className="text-body-2 cursor-pointer border-b border-other-outlined-border px-4 py-2 text-text-secondary transition-colors last:border-0 hover:bg-action-active"
            >
              {option.name}
            </li>
          ))}

          {filteredOptions.length === 0 &&
            selectedItems.length === MOCK_CHAPTERS.length && (
              <li className="px-4 py-2 text-sm italic text-gray-400">
                Đã chọn tất cả chương
              </li>
            )}
        </ul>
      )}

      {/* Overlay để đóng khi click ra ngoài */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
