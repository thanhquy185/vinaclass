import { Icon } from "@/components/atomic/atoms";
import React from "react";

// Keep the palette minimal: info, error, and default.
export type BadgeColor = "info" | "error" | "default";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  icon?: string;
  className?: string;
}

export const Badge = ({
  children,
  color = "info", // Use info blue by default.
  icon,
  className = "",
}: BadgeProps) => {
  const colorClasses: Record<BadgeColor, string> = {
    // Info: Light blue background with dark blue text for ordinary active states.
    info: "bg-alert-info-background text-alert-info-content",
    // Error: Light red background with dark red text for important active states and warnings.
    error: "bg-alert-error-background text-alert-error-content",
    default: "bg-action-hover text-text-secondary",
  };

  return (
    <div
      className={`text-body-2-semibold inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 ${colorClasses[color]} ${className}`}
    >
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
    </div>
  );
};
