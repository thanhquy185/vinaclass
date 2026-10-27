import type { ReactNode } from "react";
import { Modal } from "antd";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type AppDialogTone = "neutral" | "primary" | "danger" | "warning" | "success";

export interface AppDialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: AppDialogTone;
  width?: string | number;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const toneStyles: Record<AppDialogTone, string> = {
  neutral: "bg-action-hover text-text-secondary",
  primary: "bg-custom-background-primary-background text-primary-main",
  danger: "bg-custom-background-error-background text-error-main",
  warning: "bg-custom-background-warning-background text-warning-main",
  success: "bg-custom-background-success-background text-success-main",
};

export function AppDialog({
  open,
  title,
  description,
  icon,
  tone = "neutral",
  width = "min(760px, calc(100vw - 32px))",
  busy = false,
  onClose,
  children,
  footer,
}: AppDialogProps) {
  return (
    <Modal
      open={open}
      title={
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                toneStyles[tone]
              )}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <span className="min-w-0 pt-0.5">
            <span className="block text-lg font-semibold leading-6 text-text-primary">
              {title}
            </span>
            {description && (
              <span className="mt-1 block text-sm font-normal leading-5 text-text-secondary">
                {description}
              </span>
            )}
          </span>
        </div>
      }
      onCancel={busy ? undefined : onClose}
      footer={footer ?? null}
      width={width}
      centered
      closable={!busy}
      keyboard={!busy}
      closeIcon={<X size={18} aria-hidden="true" />}
      maskClosable={false}
      destroyOnHidden
      classNames={{
        container:
          "!overflow-hidden !rounded-2xl !bg-background-paper !shadow-2xl",
        header:
          "!mb-0 !border-b !border-other-divider !bg-background-paper !px-5 !pb-4 !pt-5 sm:!px-6",
        title: "!whitespace-normal !font-normal",
        body: "!max-h-[calc(100vh-230px)] !overflow-y-auto !p-0",
        footer: "!border-0 !px-5 !pb-5 !pt-4 sm:!px-6",
      }}
      styles={{ container: { padding: 0 } }}
    >
      {children}
    </Modal>
  );
}
