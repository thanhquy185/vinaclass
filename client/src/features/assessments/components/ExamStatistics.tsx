import {
  UserCheck,
  UserPlus,
  UserX,
  BarChart3,
  TrendingDown,
  ThumbsDown,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ExamAttempt, User } from "@/shared/types";
import { buildExamStatisticsMetrics } from "@/features/assessments/utils/examStatistics";
import ExamScoreDistributionChart from "@/features/assessments/components/ExamScoreDistributionChart";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  textColor: string;
  iconBgColor: string;
}

interface ExamStatisticsProps {
  students: User[];
  examAttempts: ExamAttempt[];
}

export default function ExamStatistics({
  students,
  examAttempts,
}: ExamStatisticsProps) {
  const { t } = useTranslation();

  const metrics = useMemo(
    () => buildExamStatisticsMetrics(students, examAttempts),
    [students, examAttempts],
  );
  const statsSummary = useMemo<StatItem[]>(
    () => [
      {
        label: t("statSection.summary.submitted"),
        value: metrics.submittedCount,
        icon: <UserCheck size={20} />,
        textColor: "text-primary-main",
        iconBgColor: "bg-primary-background",
      },
      {
        label: t("statSection.summary.unsubmitted"),
        value: metrics.unsubmittedCount,
        icon: <UserPlus size={20} />,
        textColor: "text-warning-main",
        iconBgColor: "bg-warning-background",
      },
      {
        label: t("statSection.summary.totalStudents"),
        value: metrics.totalStudents,
        icon: <UserX size={20} />,
        textColor: "text-error-main",
        iconBgColor: "bg-error-background",
      },
      {
        label: t("statSection.summary.avgScore"),
        value: metrics.averageScore.toFixed(2),
        icon: <BarChart3 size={20} />,
        textColor: "text-info-main",
        iconBgColor: "bg-info-background",
      },
      {
        label: t("statSection.summary.scoreLE", { score: 1 }),
        value: metrics.countAtMostOne,
        icon: <TrendingDown size={20} />,
        textColor: "text-error-dark",
        iconBgColor: "bg-error-background",
      },
      {
        label: t("statSection.summary.scoreLE", { score: 5 }),
        value: metrics.countAtMostFive,
        icon: <ThumbsDown size={20} />,
        textColor: "text-warning-dark",
        iconBgColor: "bg-warning-background",
      },
      {
        label: t("statSection.summary.scoreGE", { score: 5 }),
        value: metrics.countAtLeastFive,
        icon: <ThumbsUp size={20} />,
        textColor: "text-success-main",
        iconBgColor: "bg-success-background",
      },
      {
        label: t("statSection.summary.maxScore"),
        value: metrics.maxScore.toFixed(2),
        icon: <Trophy size={20} />,
        textColor: "text-primary-dark",
        iconBgColor: "bg-primary-background",
      },
    ],
    [metrics, t],
  );

  return (
    <div className="flex flex-col gap-6 bg-background-body-background p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsSummary.map((item, idx) => (
          <div
            key={idx}
            className="group flex items-center justify-between rounded-xl border border-other-outlined-border bg-background-paper p-5 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="text-h5 leading-none text-text-primary">
                {item.value}
              </span>
              <span className="text-overline text-text-secondary">
                {item.label}
              </span>
            </div>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${item.iconBgColor} ${item.textColor}`}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <ExamScoreDistributionChart data={metrics.scoreDistribution} />
    </div>
  );
}
