import { Alert, Button } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface QueryErrorAlertProps {
  message: ReactNode;
  description?: ReactNode;
  onRetry?: () => void | Promise<unknown>;
  retryLabel?: ReactNode;
  isRetrying?: boolean;
  retryButtonVariant?: "outlined" | "link";
  type?: "error" | "warning";
  className?: string;
}

export function QueryErrorAlert({
  message,
  description,
  onRetry,
  retryLabel,
  isRetrying = false,
  retryButtonVariant = "outlined",
  type = "error",
  className,
}: QueryErrorAlertProps) {
  const { t } = useTranslation("common");
  const isLinkButton = retryButtonVariant === "link";

  return (
    <Alert
      className={className}
      type={type}
      showIcon
      message={message}
      description={description}
      action={
        onRetry ? (
          <Button
            size="small"
            htmlType="button"
            type={isLinkButton ? "link" : "default"}
            variant={isLinkButton ? undefined : "outlined"}
            onClick={() => void onRetry()}
            loading={isRetrying}
          >
            {retryLabel ?? t("tableActions.retry")}
          </Button>
        ) : undefined
      }
    />
  );
}
