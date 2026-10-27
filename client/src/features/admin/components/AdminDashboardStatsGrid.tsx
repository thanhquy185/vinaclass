import type { AdminDashboardSummary } from "@/features/admin/api/dashboard.service";
import { AdminDashboardStatCard } from "@/features/admin/components/AdminDashboardStatCard";
import { useTranslation } from "react-i18next";

interface AdminDashboardStatsGridProps {
  stats?: AdminDashboardSummary["stats"];
  isLoading: boolean;
  isError: boolean;
  locale: string;
}

export function AdminDashboardStatsGrid({
  stats,
  isLoading,
  isError,
  locale,
}: AdminDashboardStatsGridProps) {
  const { t } = useTranslation("common");
  const statCards = [
    {
      key: "students",
      title: t("dashboard.stats.totalStudents"),
      value: stats?.totalStudents ?? 0,
      icon: "users" as const,
      colorClass: "bg-alert-error-content",
      to: "/users",
    },
    {
      key: "classes",
      title: t("dashboard.stats.activeClasses"),
      value: stats?.activeClasses ?? 0,
      icon: "clipboard" as const,
      colorClass: "bg-alert-info-content",
      to: "/course-group",
    },
    {
      key: "exams",
      title: t("dashboard.stats.activeExams"),
      value: stats?.activeExams ?? 0,
      icon: "calendar" as const,
      colorClass: "bg-alert-warning-content",
      to: "/tests",
    },
    {
      key: "questions",
      title: t("dashboard.stats.questionBank"),
      value: stats?.questionBank ?? 0,
      icon: "question" as const,
      colorClass: "bg-alert-success-content",
      to: "/question",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {statCards.map(({ key, ...stat }) => (
        <AdminDashboardStatCard
          key={key}
          {...stat}
          isLoading={isLoading}
          isError={isError}
          locale={locale}
        />
      ))}
    </div>
  );
}
