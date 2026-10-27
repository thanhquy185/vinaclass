import { BookOpenCheck, GraduationCap, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import { SummaryStatCard } from "@/shared/components/ui";

interface CourseGroupManagementStatsProps {
  courseGroups: CourseGroup[];
  isLoading: boolean;
}

export function CourseGroupManagementStats({
  courseGroups,
  isLoading,
}: CourseGroupManagementStatsProps) {
  const { t, i18n } = useTranslation("common");
  const activeCount = courseGroups.filter((group) => !group.isHidden).length;
  const studentCount = courseGroups.reduce(
    (total, group) => total + (group.studentCount ?? 0),
    0,
  );

  const stats = [
    {
      label: t("courseGroup.adminWorkspace.stats.total"),
      value: courseGroups.length,
      accent: "bg-primary-main",
      icon: <BookOpenCheck size={19} />,
    },
    {
      label: t("courseGroup.adminWorkspace.stats.active"),
      value: activeCount,
      accent: "bg-alert-info-content",
      icon: <GraduationCap size={19} />,
    },
    {
      label: t("courseGroup.adminWorkspace.stats.students"),
      value: studentCount,
      accent: "bg-alert-success-content",
      icon: <UsersRound size={19} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat) => (
        <SummaryStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value.toLocaleString(i18n.language)}
          accentClassName={stat.accent}
          isLoading={isLoading}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
