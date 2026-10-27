import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/ui/Button/Button";
import { AppDialog } from "@/shared/components/ui/AppDialog/AppDialog";
import type { AppDialogTone } from "@/shared/components/ui/AppDialog/AppDialog";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  type = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("confirm.title");
  const resolvedConfirmLabel = confirmLabel ?? t("confirm.confirm");
  const resolvedCancelLabel = cancelLabel ?? t("confirm.cancel");
  const isDanger = type === "danger";
  const icon =
    type === "warning" ? (
      <AlertTriangle size={22} />
    ) : type === "success" || type === "info" ? (
      <Info size={22} />
    ) : (
      <AlertCircle size={22} />
    );
  const tone: AppDialogTone =
    type === "danger"
      ? "danger"
      : type === "warning"
        ? "warning"
        : type === "success"
          ? "success"
          : "primary";
  const buttonColor = isDanger
    ? "error"
    : type === "warning"
      ? "warning"
      : type === "success"
        ? "success"
        : "infor";

  return (
    <AppDialog
      open={isOpen}
      onClose={onClose}
      title={resolvedTitle}
      icon={icon}
      tone={tone}
      width={520}
      busy={isLoading}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button
            variant="outline"
            color="standard"
            size="medium"
            onClick={onClose}
            disabled={isLoading}
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            variant="contained"
            color={buttonColor}
            size="medium"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {resolvedConfirmLabel}
          </Button>
        </div>
      }
    >
      <p className="px-5 py-5 text-sm leading-6 text-text-secondary sm:px-6">
        {message}
      </p>
    </AppDialog>
  );
}
