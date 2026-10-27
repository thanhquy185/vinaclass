import { Spin } from "antd";
import { useTranslation } from "react-i18next";

export default function RouteLoadingFallback() {
  const { t } = useTranslation("common");

  return (
    <div
      className="flex min-h-48 items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spin tip={t("tableActions.loading")} />
    </div>
  );
}
