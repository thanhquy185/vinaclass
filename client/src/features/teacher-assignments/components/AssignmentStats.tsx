import { BookOpenCheck, BookOpenText, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AssignmentOverviewStats } from "@/features/teacher-assignments/types/teacherAssignment";
import { SummaryStatCard } from "@/shared/components/ui";

interface AssignmentStatsProps {
  stats: AssignmentOverviewStats;
  isLoading: boolean;
}

export function AssignmentStats({ stats, isLoading }: AssignmentStatsProps) {
  const { t, i18n } = useTranslation("common");
  const statsList = [
    {
      label: t("assignmentPage.stats.assignments"),
      value: stats.assignmentCount,
      accent: "bg-primary-main",
      icon: <BookOpenCheck size={19} />,
    },
    {
      label: t("assignmentPage.stats.teachers"),
      value: stats.teacherCount,
      accent: "bg-alert-info-content",
      icon: <UsersRound size={19} />,
    },
    {
      label: t("assignmentPage.stats.subjects"),
      value: stats.subjectCount,
      accent: "bg-alert-success-content",
      icon: <BookOpenText size={19} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {statsList.map((stat) => (
        <SummaryStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value.toLocaleString(i18n.language)}
          accentClassName={stat.accent}
          icon={stat.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
