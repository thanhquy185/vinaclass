import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface AdminReadOnlyFieldProps {
  label: ReactNode;
  value?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export function AdminReadOnlyField({
  label,
  value,
  className,
  valueClassName,
}: AdminReadOnlyFieldProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg bg-background-body px-3.5 py-3",
        className,
      )}
    >
      <div className="text-caption text-text-secondary">{label}</div>
      <div
        className={cn(
          "mt-1 min-w-0 text-sm font-medium leading-5 text-text-primary",
          valueClassName,
        )}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}
