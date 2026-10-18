type StatusVariant = "success" | "warning" | "error" | "info";

interface StatusLabelProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "border-alert-success-content text-alert-success-content",
  warning: "border-alert-warning-content text-alert-warning-content",
  error: "border-alert-error-content text-alert-error-content",
  info: "border-alert-info-content text-alert-info-content",
};

export const StatusLabel = ({
  children,
  variant = "success",
  className,
}: StatusLabelProps) => {
  return (
    <span
      className={`text-caption inline-flex items-center justify-center rounded-md border p-1 ${variantStyles[variant]} ${className} `}
    >
      {children}
    </span>
  );
};
