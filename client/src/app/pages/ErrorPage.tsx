import { useTranslation } from "react-i18next";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import ErrorScreen from "@/app/components/ErrorScreen";

function getRouteErrorMessage(error: unknown, fallback: string): string {
  if (isRouteErrorResponse(error)) return error.statusText || fallback;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error;
  return fallback;
}

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const fallbackMessage = t("errorScreen.unknownError");
  let status = t("errorScreen.genericStatus");
  let detail = "";

  if (isRouteErrorResponse(error)) {
    status = String(error.status);
    detail = typeof error.data?.message === "string" ? error.data.message : "";
  } else if (error instanceof Error) {
    detail = error.stack ?? "";
  }

  console.error("Route Error:", error);

  const diagnostics =
    import.meta.env.DEV && detail
      ? [
          {
            key: "route-error-details",
            label: t("errorScreen.technicalDetails"),
            content: detail,
          },
        ]
      : [];

  return (
    <ErrorScreen
      title={t("errorScreen.routeTitle")}
      subtitle={t("errorScreen.routeDescription")}
      status={status}
      message={getRouteErrorMessage(error, fallbackMessage)}
      diagnostics={diagnostics}
      actions={[
        {
          key: "back",
          label: t("errorScreen.goBack"),
          onClick: () => navigate(-1),
        },
        {
          key: "home",
          label: t("errorScreen.goHome"),
          onClick: () => navigate("/"),
          primary: true,
        },
      ]}
      helpText={t("errorScreen.routeHelp")}
    />
  );
}
