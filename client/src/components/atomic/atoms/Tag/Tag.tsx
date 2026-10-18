import { X } from "lucide-react";
import Button from "../Button/Button";

interface TagProps {
  label: string;
  onRemove: () => void;
}

export const Tag = ({ label, onRemove }: TagProps) => (
  <span className="text-body-2 flex items-center gap-1 rounded-md bg-primary-main px-2 py-1 text-primary-contrast shadow-sm duration-200 animate-in fade-in zoom-in">
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      size="small"
      variant={"contained"}
      color="primary"
    >
      <X size={14} strokeWidth={3} />
    </Button>
    <span className="whitespace-nowrap font-medium">{label}</span>
  </span>
);
