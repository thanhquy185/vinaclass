import { useState, useRef, type ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export const Dropdown = ({
  trigger,
  children,
  align = "left",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sửa lỗi: Sử dụng ReturnType để không phụ thuộc vào namespace NodeJS
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    // Xóa timer đóng nếu người dùng quay lại vùng hover nhanh chóng
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Tạo trễ 200ms để người dùng kịp di chuyển chuột xuống menu nội dung
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger: Thêm chút padding bottom để nối liền khoảng cách với menu */}
      <div className="cursor-pointer pb-1 text-text-primary">{trigger}</div>

      {/* Menu Box: Dùng CSS để điều khiển hiển thị thay vì {isOpen && ...} 
          để transition (opacity/translate) có hiệu lực */}
      <div
        className={`absolute z-50 w-56 rounded-md border border-other-outlined-border bg-background-paper shadow-lg ${align === "right" ? "right-0" : "left-0"} transition-all duration-200 ease-out ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="py-1" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      </div>
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  variant?: "default" | "error";
}

export const DropdownItem = ({
  children,
  onClick,
  className = "",
  icon,
  variant = "default",
}: DropdownItemProps) => {
  // Xác định màu sắc dựa trên variant
  const variantClasses =
    variant === "error"
      ? "text-error-main hover:bg-error-background"
      : "text-text-primary hover:bg-action-hover";

  return (
    <button
      onClick={onClick}
      className={`text-body-2 flex w-full items-center px-4 py-2 transition-colors ${variantClasses} ${className}`}
    >
      {icon && (
        <span className="mr-3 flex items-center justify-center">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
