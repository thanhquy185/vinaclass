import type { ReactNode } from "react";
import { Button, Icon } from "@/shared/components/ui";
import { AdminPanel } from "@/shared/components/admin/AdminPanel";

interface AdminFilterPanelProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  resetLabel: string;
  onReset: () => void;
  resetDisabled?: boolean;
}

export function AdminFilterPanel({
  children,
  title,
  description,
  resetLabel,
  onReset,
  resetDisabled = false,
}: AdminFilterPanelProps) {
  const hasHeading = Boolean(title || description);
  const resetButton = (
    <Button
      variant="outline"
      size="medium"
      className="!h-11 !shrink-0 !rounded-lg px-3"
      disabled={resetDisabled}
      onClick={onReset}
    >
      <Icon name="refresh" size={17} />
      {resetLabel}
    </Button>
  );

  return (
    <AdminPanel
      className={
        hasHeading ? "flex flex-col gap-4 p-4 sm:p-5" : "p-4 sm:p-5"
      }
    >
      {hasHeading ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h2 className="text-body-1 font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-caption mt-1 text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            {resetButton}
          </div>
          {children}
        </>
      ) : (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">{children}</div>
          {resetButton}
        </div>
      )}
    </AdminPanel>
  );
}
