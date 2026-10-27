import type { ReactNode } from "react";
import { Button, Icon } from "@/shared/components/ui";
import { AdminPanel } from "@/shared/components/admin/AdminPanel";

interface AdminTablePanelAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface AdminTablePanelProps {
  title: ReactNode;
  description?: ReactNode;
  createAction?: AdminTablePanelAction;
  children: ReactNode;
}

export function AdminTablePanel({
  title,
  description,
  createAction,
  children,
}: AdminTablePanelProps) {
  return (
    <AdminPanel className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-body-1 font-semibold text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="text-caption mt-1 text-text-secondary">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {createAction && (
            <Button
              variant="contained"
              color="primary"
              size="medium"
              className="!h-11 !rounded-lg px-4 shadow-sm"
              disabled={createAction.disabled}
              onClick={createAction.onClick}
            >
              <Icon name="plus" size={19} />
              {createAction.label}
            </Button>
          )}
        </div>
      </div>
      {children}
    </AdminPanel>
  );
}
