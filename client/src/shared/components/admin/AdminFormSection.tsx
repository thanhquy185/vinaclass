import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface AdminFormSectionProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AdminFormSection({
  title,
  description,
  icon,
  children,
  className,
  contentClassName,
}: AdminFormSectionProps) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-3 flex items-start gap-2">
        {icon && (
          <span
            className="mt-0.5 shrink-0 text-primary-main"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
        </div>
      </div>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </section>
  );
}
