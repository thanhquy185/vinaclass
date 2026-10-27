import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface AdminFilterFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function AdminFilterField({
  label,
  htmlFor,
  children,
  className,
}: AdminFilterFieldProps) {
  const labelClassName =
    "absolute left-3 top-2 z-10 -translate-y-1/2 bg-background-paper px-1 text-xs font-medium leading-none text-text-secondary";

  return (
    <div className={cn("relative min-w-0", label && "pt-2", className)}>
      {label && (
        htmlFor ? (
          <label htmlFor={htmlFor} className={labelClassName}>
            {label}
          </label>
        ) : (
          <span className={labelClassName}>{label}</span>
        )
      )}
      {children}
    </div>
  );
}
