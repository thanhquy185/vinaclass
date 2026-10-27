import type { ReactNode } from "react";
import { AdminPanel } from "@/shared/components/admin";

interface AssessmentPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
}

/** Page-sized counterpart to the shared AppDialog header. */
export function AssessmentPageHeader({
  title,
  description,
  icon,
  badge,
  actions,
}: AssessmentPageHeaderProps) {
  return (
    <AdminPanel className="flex min-w-0 flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-custom-background-primary-background text-primary-main">
          {icon}
        </span>
        <div className="min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-h5 break-words font-semibold text-text-primary sm:text-h4">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-body-2 mt-1 text-text-secondary sm:text-body-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </AdminPanel>
  );
}
