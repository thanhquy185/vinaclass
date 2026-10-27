import { ArrowRight, Lock, Unlock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { User } from "@/features/identity/types/identity";
import { AppDialog, Button } from "@/shared/components/ui";
import { UserConfirmationSummary } from "@/features/identity/components/UserConfirmationSummary";

interface UserStatusDialogProps {
  user: User;
  isUpdating: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function UserStatusDialog({
  user,
  isUpdating,
  onClose,
  onConfirm,
}: UserStatusDialogProps) {
  const { t } = useTranslation("common");
  const isLocking = !user.isLocked;
  const actionLabel = t(
    isLocking ? "userPage.lockAction" : "userPage.unlockAction"
  );
  const currentStatusLabel = t(
    user.isLocked ? "userPage.status.locked" : "userPage.status.active"
  );
  const nextStatusLabel = t(
    isLocking ? "userPage.status.locked" : "userPage.status.active"
  );

  return (
    <AppDialog
      open
      onClose={onClose}
      title={
        isLocking
          ? t("userPage.confirmLockTitle")
          : t("userPage.confirmUnlockTitle")
      }
      description={t(
        isLocking
          ? "userPage.dialog.lockDescription"
          : "userPage.dialog.unlockDescription"
      )}
      icon={isLocking ? <Lock size={21} /> : <Unlock size={21} />}
      tone={isLocking ? "warning" : "success"}
      width={520}
      busy={isUpdating}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onClose}
            disabled={isUpdating}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={() => void onConfirm()}
            loading={isUpdating}
            disabled={isUpdating}
          >
            {actionLabel}
          </Button>
        </div>
      }
    >
      <UserConfirmationSummary user={user}>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-action-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
            {currentStatusLabel}
          </span>
          <ArrowRight size={14} className="text-text-disabled" />
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isLocking
                ? "bg-custom-background-error-background text-alert-error-content"
                : "bg-custom-background-success-background text-alert-success-content"
            }`}
          >
            {nextStatusLabel}
          </span>
        </div>
        <p className="mt-2 text-sm leading-5 text-text-secondary">
          {t(
            isLocking
              ? "userPage.confirmLockUser"
              : "userPage.confirmUnlockUser",
            { username: user.username }
          )}
        </p>
      </UserConfirmationSummary>
    </AppDialog>
  );
}
