import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface AdminHeaderPanelProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function AdminHeaderPanel({
  title,
  description,
  actions,
  children,
  className,
}: AdminHeaderPanelProps) {
  return (
    <header className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-h5 font-semibold text-text-primary sm:text-h4">
            {title}
          </h1>
          {description && (
            <p className="text-body-1 mt-1 text-text-secondary">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
