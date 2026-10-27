import type { AdminDashboardSummary } from "@/features/admin/api/dashboard.service";
import { AdminDashboardListPanel } from "@/features/admin/components/AdminDashboardListPanel";
import { Icon } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface AdminDashboardOverviewProps {
  recentClasses: AdminDashboardSummary["recentClasses"];
  upcomingExams: AdminDashboardSummary["upcomingExams"];
  isLoading: boolean;
  isError: boolean;
  locale: string;
}

const formatDateTime = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
};

export function AdminDashboardOverview({
  recentClasses,
  upcomingExams,
  isLoading,
  isError,
  locale,
}: AdminDashboardOverviewProps) {
  const { t } = useTranslation("common");
  const errorMessage = t("dashboard.loadError");
  const viewAllLabel = t("dashboard.viewAll");

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <AdminDashboardListPanel
        title={t("dashboard.classrooms.title")}
        viewAllPath="/course-group"
        viewAllLabel={viewAllLabel}
        items={recentClasses}
        getItemKey={(courseGroup) => courseGroup.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyDescription={t("dashboard.classrooms.empty")}
        renderItem={(courseGroup) => (
          <Link
            to="/course-group"
            className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-2 last:pb-2"
          >
            <div className="min-w-0">
              <p className="text-body-2 truncate font-semibold text-text-primary">
                {courseGroup.groupName}
              </p>
              <p className="text-caption mt-1 truncate text-text-secondary">
                {courseGroup.subjectName ??
                  t("dashboard.classrooms.subjectUnavailable")}
                {typeof courseGroup.studentCount === "number" &&
                  ` · ${t("dashboard.classrooms.studentCount", {
                    count: courseGroup.studentCount,
                  })}`}
              </p>
            </div>
            <Icon
              name="chevronRight"
              size={18}
              className="shrink-0 text-text-disabled"
            />
          </Link>
        )}
      />

      <AdminDashboardListPanel
        title={t("dashboard.upcomingExams.title")}
        viewAllPath="/tests"
        viewAllLabel={viewAllLabel}
        items={upcomingExams}
        getItemKey={(exam) => exam.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyDescription={t("dashboard.upcomingExams.empty")}
        renderItem={(exam) => (
          <Link
            to="/tests"
            className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-2 last:pb-2"
          >
            <p className="text-body-2 min-w-0 truncate font-semibold text-text-primary">
              {exam.examName}
            </p>
            <span className="text-caption shrink-0 rounded-full bg-action-focus px-2.5 py-1 text-text-secondary">
              {formatDateTime(exam.startTime, locale)}
            </span>
          </Link>
        )}
      />
    </div>
  );
}
