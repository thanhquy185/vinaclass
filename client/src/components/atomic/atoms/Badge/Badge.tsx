import { Icon } from "@/components/atomic/atoms";
import React from "react";

// Tối giản màu sắc, chỉ dùng Info (Màu lỳ), Error (Cảnh báo đỏ), và Default
export type BadgeColor = "info" | "error" | "default";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  icon?: string;
  className?: string;
}

export const Badge = ({
  children,
  color = "info", // Mặc định là màu xanh lỳ
  icon,
  className = "",
}: BadgeProps) => {
  const colorClasses: Record<BadgeColor, string> = {
    // Info: Nền xanh nhạt lỳ, chữ xanh đậm (Dùng cho Active state thông thường)
    info: "bg-alert-info-background text-alert-info-content",
    // Error: Nền đỏ nhạt, chữ đỏ đậm (Dùng cho Active state quan trọng/cảnh báo)
    error: "bg-alert-error-background text-alert-error-content",
    default: "bg-action-hover text-text-secondary",
  };

  return (
    <div
      className={`/* Bo góc lỳ hơn, to hơn */ text-body-2-semibold /* Font chữ to hơn, đậm hơn */ inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 ${colorClasses[color]} ${className} `}
    >
      {icon && <Icon name={icon} size={16} /* Icon to hơn */ />}
      <span>{children}</span>
    </div>
  );
};
