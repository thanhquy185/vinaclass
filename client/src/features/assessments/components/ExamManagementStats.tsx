import { CalendarClock, ClipboardList, Clock3, FileCheck2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getTestsStatus } from "@/features/assessments/utils/exam";
import { SummaryStatCard } from "@/shared/components/ui";
import type { Exam } from "@/shared/types";

interface ExamManagementStatsProps {
  exams: Exam[];
  isLoading: boolean;
  now: number;
}

export function ExamManagementStats({
  exams,
  isLoading,
  now,
}: ExamManagementStatsProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const stats = useMemo(() => {
    const visibleExams = exams.filter((exam) => !exam.isDeleted);
    const currentTime = new Date(now);

    return {
      total: visibleExams.length,
      opening: visibleExams.filter(
        (exam) =>
          getTestsStatus(exam.startTime, exam.endTime, currentTime).status ===
          "OPENING"
      ).length,
      upcoming: visibleExams.filter(
        (exam) =>
          getTestsStatus(exam.startTime, exam.endTime, currentTime).status ===
          "UPCOMING"
      ).length,
      closed: visibleExams.filter(
        (exam) =>
          getTestsStatus(exam.startTime, exam.endTime, currentTime).status ===
          "CLOSED"
      ).length,
    };
  }, [exams, now]);

  const cards = [
    {
      label: t("testPage.stats.total"),
      value: stats.total,
      accent: "bg-primary-main",
      icon: <ClipboardList size={19} />,
    },
    {
      label: t("testPage.stats.opening"),
      value: stats.opening,
      accent: "bg-alert-info-content",
      icon: <FileCheck2 size={19} />,
    },
    {
      label: t("testPage.stats.upcoming"),
      value: stats.upcoming,
      accent: "bg-alert-success-content",
      icon: <CalendarClock size={19} />,
    },
    {
      label: t("testPage.stats.closed"),
      value: stats.closed,
      accent: "bg-alert-warning-content",
      icon: <Clock3 size={19} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryStatCard
          key={card.label}
          label={card.label}
          value={card.value.toLocaleString(locale)}
          accentClassName={card.accent}
          icon={card.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
