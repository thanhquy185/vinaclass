import type { ReactNode } from "react";
import type { HookAPI as ModalApi } from "antd/es/modal/useModal";

export type ConfirmationType = "danger" | "warning" | "info" | "success";

export interface ConfirmationOptions {
  title?: ReactNode;
  message: ReactNode;
  type?: ConfirmationType;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function openConfirmation(
  modal: ModalApi,
  {
    title,
    message,
    type = "danger",
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy",
    onConfirm,
    onCancel,
  }: ConfirmationOptions
) {
  modal.confirm({
    title: title ?? "Xác nhận",
    content: message,
    type: type === "danger" ? "confirm" : type,
    okText: confirmLabel,
    cancelText: cancelLabel,
    okButtonProps: { danger: type === "danger" },
    centered: true,
    onOk: onConfirm,
    onCancel,
  });
}
