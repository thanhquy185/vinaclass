import { CheckCircle2, AlertCircle, XCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastStyles: Record<ToastType, string> = {
  success:
    "bg-success-background border-alert-success-content text-alert-success-content",
  error:
    "bg-error-background border-alert-error-content text-alert-error-content",
  warning:
    "bg-warning-background border-warning-success-content text-warning-success-content",
  info: "bg-info-background border-alert-infor-content text-alert-infor-content",
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertCircle size={20} />,
  info: <Info size={20} />,
};

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-background-body-background shadow-lg duration-300 animate-in fade-in slide-in-from-top-5 ${toastStyles[type]} `}
      role="alert"
    >
      <div className="flex items-center gap-3 bg-background-body-background px-4 py-3">
        <div className="flex-shrink-0">{toastIcons[type]}</div>

        <span className="text-body-2-semibold flex-1">{message}</span>

        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-black/5"
          aria-label="Close"
        >
          <X size={16} className="opacity-70" />
        </button>
      </div>
    </div>
  );
}
