import type { ErrorInfo } from "react";
import { useTranslation } from "react-i18next";
import ErrorScreen from "@/app/components/ErrorScreen";

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError?: () => void;
}

export default function ErrorFallback({
  error,
  errorInfo,
  resetError,
}: ErrorFallbackProps) {
  const { t } = useTranslation("common");
  const diagnostics = import.meta.env.DEV
    ? [
        {
          key: "error-stack",
          label: t("errorScreen.stackTrace"),
          content: error?.stack ?? "",
        },
        {
          key: "component-stack",
          label: t("errorScreen.componentStack"),
          content: errorInfo?.componentStack ?? "",
        },
      ]
    : [];

  return (
    <ErrorScreen
      title={t("errorScreen.boundaryTitle")}
      subtitle={t("errorScreen.boundaryDescription")}
      message={error?.message || t("errorScreen.unknownError")}
      diagnostics={diagnostics}
      actions={[
        ...(resetError
          ? [
              {
                key: "retry",
                label: t("errorScreen.retry"),
                onClick: resetError,
                primary: true,
              },
            ]
          : []),
        {
          key: "home",
          label: t("errorScreen.goHome"),
          onClick: () => {
            window.location.href = "/";
          },
        },
      ]}
      helpText={t("errorScreen.boundaryHelp")}
    />
  );
}
