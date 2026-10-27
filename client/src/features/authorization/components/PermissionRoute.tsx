import { Spin } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { usePermissionNavigation } from "@/features/authorization/hooks/usePermissionNavigation";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";

type PermissionRouteProps = {
  functionName: string;
  actionCode?: string;
  children?: ReactNode;
};

const PermissionRoute = ({
  functionName,
  actionCode = "VIEW",
  children,
}: PermissionRouteProps) => {
  const { t } = useTranslation("common");
  const {
    navigation,
    isEnabled,
    isLoading,
    isFetching,
    isError,
    refetch,
    hasFunctionAction,
  } = usePermissionNavigation();

  if (!isEnabled) {
    return children ?? <Outlet />;
  }

  if (isLoading) {
    return (
      <MainContentLayout className="w-full" hasFooter={false}>
        <div
          className="flex min-h-48 items-center justify-center"
          role="status"
        >
          <Spin tip={t("authorization.permissionLoading")} />
        </div>
      </MainContentLayout>
    );
  }

  if (isError || !navigation) {
    return (
      <MainContentLayout className="w-full" hasFooter={false}>
        <QueryErrorAlert
          message={t("authorization.permissionLoadError")}
          retryLabel={t("authorization.retry")}
          onRetry={refetch}
          isRetrying={isFetching}
        />
      </MainContentLayout>
    );
  }

  if (!hasFunctionAction(functionName, actionCode)) {
    return (
      <MainContentLayout className="w-full" hasFooter={false}>
        <PermissionDeniedAlert message={t("authorization.routeDenied")} />
      </MainContentLayout>
    );
  }

  return children ?? <Outlet />;
};

export default PermissionRoute;
