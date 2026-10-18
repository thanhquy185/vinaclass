import { Input } from "../../atoms";
import type { InputProps } from "../../atoms/Input/Input";

interface GroupInputProps extends InputProps {
  labelLeft?: string;
  labelRight?: string;
}

export default function GroupInput({
  labelLeft,
  labelRight,
  ...props
}: GroupInputProps) {
  return (
    <div className="flex items-center rounded-md border border-other-outlined-border">
      {labelLeft && (
        <div className="bg-action-hover px-5 py-2">{labelLeft}</div>
      )}
      <Input {...props} className="flex-1 rounded-none !border-y-0" />
      {labelRight && (
        <div className="bg-action-hover px-5 py-2">{labelRight}</div>
      )}
    </div>
  );
}
