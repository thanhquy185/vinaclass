import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Role } from "@/shared/types";
import { AppDialog, Button } from "@/shared/components/ui";
import { PermissionGroupIdentityCard } from "@/features/authorization/components/PermissionGroupIdentityCard";

interface PermissionGroupDeleteDialogProps {
  role: Role;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: (role: Role) => void | Promise<void>;
}

export function PermissionGroupDeleteDialog({
  role,
  isDeleting,
  onClose,
  onDelete,
}: PermissionGroupDeleteDialogProps) {
  const { t } = useTranslation("common");

  return (
    <AppDialog
      open
      onClose={onClose}
      title={t("permissionGroupPage.confirmDeleteTitle")}
      description={t("permissionGroupPage.deleteDescription")}
      icon={<AlertTriangle size={21} />}
      tone="danger"
      width={520}
      busy={isDeleting}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={() => void onDelete(role)}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {t("tableActions.remove")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <PermissionGroupIdentityCard role={role} />
        <p className="text-sm leading-5 text-text-secondary">
          {t("permissionGroupPage.confirmDeleteMessage", {
            name: role.roleName,
          })}
        </p>
      </div>
    </AppDialog>
  );
}
