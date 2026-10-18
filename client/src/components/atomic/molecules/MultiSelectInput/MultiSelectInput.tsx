import { Input } from "../../atoms";
import { Tag } from "../../atoms/Tag/Tag";

interface MultiSelectInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedItems: any[];
  onRemoveItem: (id: number) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  onFocus: () => void;
}

export const MultiSelectInput = ({
  selectedItems,
  onRemoveItem,
  inputValue,
  setInputValue,
  onFocus,
}: MultiSelectInputProps) => (
  <div
    className="flex min-h-[45px] flex-1 cursor-text flex-wrap gap-2 rounded-md border border-other-outlined-border p-1.5 transition-all focus-within:border-primary-main"
    onClick={onFocus}
  >
    {selectedItems.map((item) => (
      <Tag
        key={item.id}
        label={item.name}
        onRemove={() => onRemoveItem(item.id)}
      />
    ))}
    <Input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="min-w-[50px] flex-grow border-none bg-transparent outline-none"
      placeholder={selectedItems.length === 0 ? "Chọn chương..." : ""}
    />
  </div>
);
