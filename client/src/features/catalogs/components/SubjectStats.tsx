import { BookOpen, GraduationCap, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Subject } from "@/shared/types";
import { SummaryStatCard } from "@/shared/components/ui";

interface SubjectStatsProps {
  subjects: Subject[];
  isLoading: boolean;
}

export function SubjectStats({ subjects, isLoading }: SubjectStatsProps) {
  const { t, i18n } = useTranslation("common");
  const totalChapters = subjects.reduce(
    (total, subject) =>
      total + (subject.chaptersCount ?? subject.chapters?.length ?? 0),
    0,
  );
  const totalCourseGroups = subjects.reduce(
    (total, subject) => total + (subject.courseGroupsCount ?? 0),
    0,
  );

  const stats = [
    {
      label: t("subjectPage.stats.total"),
      value: subjects.length,
      accent: "bg-primary-main",
      icon: <GraduationCap size={19} />,
    },
    {
      label: t("subjectPage.stats.chapters"),
      value: totalChapters,
      accent: "bg-alert-info-content",
      icon: <BookOpen size={19} />,
    },
    {
      label: t("subjectPage.stats.courseGroups"),
      value: totalCourseGroups,
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
