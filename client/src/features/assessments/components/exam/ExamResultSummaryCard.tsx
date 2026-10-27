import { Printer } from "lucide-react";
import { Button, Icon } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";
import {
  getTextProgress,
  getTextProgressColor,
} from "@/features/assessments/utils/progress";

export interface ExamResultSummaryStats {
  score: number;
  percentage: number;
  totalPoints: number;
  durationText: string;
  violationCount: number;
  dateStarted: string;
  dateFinished: string;
}

interface ExamResultSummaryCardProps {
  examName?: string;
  studentName?: string;
  stats: ExamResultSummaryStats;
  showScore: boolean;
  showPercentage: boolean;
  canPrint: boolean;
  violationLimit: number;
}

export default function ExamResultSummaryCard({
  examName,
  studentName,
  stats,
  showScore,
  showPercentage,
  canPrint,
  violationLimit,
}: ExamResultSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center overflow-hidden rounded-lg bg-background-body-background shadow-custom">
      <div className="flex-1 px-8 py-6">
        <h1 className="text-h5 mb-2 font-bold text-text-primary">{examName}</h1>
        <div className="text-body-2 mb-6 flex items-center gap-2">
          <span className="flex items-center">
            <Icon name="user" size={16} className="mr-1" /> {studentName}
          </span>
          {canPrint && (
            <Button size="small" color="primary" onClick={() => window.print()}>
              <Printer size={14} /> {t("examResultOverview.actions.print")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {showScore ? (
            <InfoRow
              label={t("examResultOverview.labels.score")}
              value={`${stats.score} / ${stats.totalPoints}`}
              highlight
            />
          ) : (
            <div className="text-body-2 italic text-text-disabled">
              {t("examResultOverview.scoreHidden")}
            </div>
          )}
          <InfoRow
            label={t("examResultOverview.labels.duration")}
            value={stats.durationText}
          />
          <InfoRow
            label={t("examResultOverview.labels.startedAt")}
            value={stats.dateStarted}
          />
          <InfoRow
            label={t("examResultOverview.labels.finishedAt")}
            value={stats.dateFinished}
          />
          <div className="text-body-2 flex items-center">
            <span className="w-32 font-bold text-text-secondary">
              {t("examResultOverview.labels.violations")}
            </span>
            <span
              className={`rounded px-2 py-0.5 ${stats.violationCount > 0 ? "bg-error-background text-alert-error-content" : "bg-action-hover text-text-disabled"}`}
            >
              {stats.violationCount} / {violationLimit}
            </span>
          </div>
        </div>
      </div>

      {showPercentage && (
        <div
          className={`flex min-h-[280px] w-64 flex-col items-center justify-center bg-background-body-background p-8 ${getTextProgressColor(stats.percentage)}`}
        >
          <div className="relative flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * stats.percentage) / 100}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-3xl font-bold">
              {stats.percentage}%
            </span>
          </div>
          <p className="mt-4 font-bold uppercase tracking-wider">
            {getTextProgress(stats.percentage)}
          </p>
        </div>
      )}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  return (
    <div className="text-body-2 flex items-center">
      <span className="w-32 font-bold text-text-secondary">{label}</span>
      <span
        className={`rounded px-2 py-0.5 ${highlight ? "bg-warning-background font-medium text-text-primary" : "text-text-secondary"}`}
      >
        {value}
      </span>
    </div>
  );
}
