import { Tag } from "antd";
import { cn } from "@/shared/utils/cn";

export type StatusVariant = "success" | "warning" | "error" | "info";
const tagColorByVariant: Record<StatusVariant, string> = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "processing",
};

export interface StatusLabelProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

export const StatusLabel = ({
  children,
  variant = "success",
  className,
}: StatusLabelProps) => {
  return (
    <Tag
      color={tagColorByVariant[variant]}
      className={cn("m-0 inline-flex items-center justify-center", className)}
    >
      {children}
    </Tag>
  );
};
