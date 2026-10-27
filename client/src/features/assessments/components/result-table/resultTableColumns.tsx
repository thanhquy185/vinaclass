import { Icon } from "@/shared/components/ui";
import type { TableColumn } from "@/shared/components/DataTable";
import { ResultProgressBar } from "@/features/assessments/components/result-table/ResultProgressBar";
import type {
  ResultTableRow,
  ResultViewMode,
} from "@/features/assessments/utils/buildResultTableData";
import { getDefaultAvatar } from "@/shared/utils/avatar";
import { getProgressColor } from "@/features/assessments/utils/progress";

interface ResultTableLabels {
  studentId: string;
  fullName: string;
  percent: string;
  score: string;
  startTime: string;
  switchCount: string;
  avatarAlt: string;
  questionNumber: string;
  difficultyLevel: string;
  questionContent: string;
  correctRate: string;
  averageScore: string;
}

const renderPercent = (value: number) => {
  const percent = Math.min(Math.max(value, 0), 100);

  return (
    <div className="flex items-center gap-2">
      <ResultProgressBar
        percent={percent}
        colorClass={getProgressColor(percent)}
      />
      <span className="text-body-2 min-w-[35px] font-semibold duration-1000 animate-in fade-in">
        {percent.toFixed(0)}%
      </span>
    </div>
  );
};

export const buildResultTableColumns = (
  viewMode: ResultViewMode,
  labels: ResultTableLabels
): TableColumn<ResultTableRow>[] => {
  if (viewMode === "user") {
    return [
      {
        title: labels.studentId,
        key: "username",
        render: (_value, row) => (
          <span>
            {row.rowType === "student" && !row.isAverage ? row.username : ""}
          </span>
        ),
      },
      {
        title: labels.fullName,
        key: "fullName",
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            {row.rowType !== "student" || !row.isAverage ? (
              <img
                src={getDefaultAvatar(row.fullName ?? "")}
                alt={labels.avatarAlt}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <Icon name="groupUser" size={20} />
            )}
            <span
              className={row.isAverage ? "font-bold text-primary-main" : ""}
            >
              {row.fullName}
            </span>
          </div>
        ),
      },
      {
        title: labels.percent,
        key: "correctRate",
        render: (_value, row) =>
          renderPercent(
            ((Number(row.examAttempt?.totalScore) || 0) / 10) * 100
          ),
      },
      {
        title: labels.score,
        key: "examAttempt",
        className: "text-center",
        id: "score",
        render: (_value, row) => {
          const score = row.examAttempt?.totalScore;
          return score == null ? "—" : `${Number(score).toFixed(2)}/10`;
        },
      },
      {
        title: labels.startTime,
        key: "examAttempt",
        className: "text-center",
        id: "startTime",
        render: (_value, row) =>
          row.examAttempt?.startTime
            ? new Date(row.examAttempt.startTime).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
      },
      {
        title: labels.switchCount,
        key: "examAttempt",
        className: "text-center",
        id: "switchCount",
        render: (_value, row) => {
          const count = row.examAttempt?.examAttemptLog?.tabSwitchCount;
          if (count == null) return "—";

          return (
            <span
              className={
                count > 0 ? "text-alert-error-main" : "text-text-primary"
              }
            >
              {count}
            </span>
          );
        },
      },
    ];
  }

  return [
    {
      title: labels.questionNumber,
      key: "questionNumber",
      className: "w-16",
    },
    {
      title:
        viewMode === "difficulty"
          ? labels.difficultyLevel
          : labels.questionContent,
      key: "content",
    },
    {
      title: labels.correctRate,
      key: "correctRate",
      render: (_value, row) => renderPercent(row.correctRate ?? 0),
    },
    {
      title: labels.averageScore,
      key: "averageScore",
      className: "text-center",
    },
  ];
};
