import { AdminDashboardOverview } from "@/features/admin/components/AdminDashboardOverview";
import { AdminDashboardStatsGrid } from "@/features/admin/components/AdminDashboardStatsGrid";
import { useAdminDashboardSummary } from "@/features/admin/hooks/useAdminDashboard";
import { QueryErrorAlert } from "@/shared/components/ui/QueryErrorAlert/QueryErrorAlert";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { AdminHeaderPanel } from "@/shared/components/admin";

export const AdminDashboardPage = () => {
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);

  if (roleCode === "STUDENT") {
    return <Navigate to="/courses" replace />;
  }

  if (roleCode === "TEACHER") {
    return <Navigate to="/course-group" replace />;
  }

  if (roleCode !== "ADMIN") {
    return <Navigate to="/profile" replace />;
  }

  return <AdminDashboard />;
};

const AdminDashboard = () => {
  const { t, i18n } = useTranslation("common");
  const {
    summary,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useAdminDashboardSummary();
  const currentDate = new Intl.DateTimeFormat(
    i18n.language === "vi" ? "vi-VN" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Ho_Chi_Minh",
    }
  ).format(new Date());

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <section className="flex flex-col gap-6 lg:gap-7">
        <AdminHeaderPanel
          title={t("dashboard.title")}
          description={t("dashboard.subtitle")}
          actions={
            <span className="text-caption w-fit rounded-full bg-background-body-background px-3 py-1.5 text-text-secondary">
              {currentDate}
            </span>
          }
        />

        {isDashboardError && (
          <QueryErrorAlert
            message={t("dashboard.loadError")}
            onRetry={refetchDashboard}
            isRetrying={isDashboardFetching}
            retryLabel={t("tableActions.retry")}
          />
        )}

        <AdminDashboardStatsGrid
          stats={summary?.stats}
          isLoading={isDashboardLoading}
          isError={isDashboardError}
          locale={i18n.language}
        />

        <AdminDashboardOverview
          recentClasses={summary?.recentClasses ?? []}
          upcomingExams={summary?.upcomingExams ?? []}
          isLoading={isDashboardLoading}
          isError={isDashboardError}
          locale={i18n.language}
        />
      </section>
    </MainContentLayout>
  );
};
