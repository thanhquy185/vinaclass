import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/shared/components/ui";
import type { StudentExam } from "@/shared/types";
import {
  calculateDuration,
  getTestsStatus,
} from "@/features/assessments/utils/exam";
import { getProgressColor } from "@/features/assessments/utils/progress";

interface CourseGroupExamNameCellProps {
  exam: StudentExam;
  isStudent: boolean;
  now: Date;
  onStartExam: (examId: number) => void;
}

export function CourseGroupExamNameCell({
  exam,
  isStudent,
  now,
  onStartExam,
}: CourseGroupExamNameCellProps) {
  const { t } = useTranslation();
  const testStatus = getTestsStatus(exam.startTime, exam.endTime, now);
  const isOpening = testStatus.status === "OPENING";
  const isUpcoming = testStatus.status === "UPCOMING";
  const buttonLabel = isUpcoming
    ? t("courseElement.classwork.status.notOpen")
    : isOpening
      ? t("courseElement.classwork.status.start")
      : t("courseElement.classwork.status.expired");

  return (
    <div className="flex items-start gap-4 py-2">
      <div className="mt-1">
        <Icon name="documentDuplicate" />
      </div>
      <div>
        <h3 className="text-body-2 font-bold leading-tight text-text-primary">
          {exam.examName}
        </h3>
        <p className="text-caption mt-1 text-text-secondary">
          {t("courseElement.classwork.durationText", {
            minutes: exam.durationMinutes,
            unit: t("courseElement.common.minuteUnit"),
          })}
        </p>

        {!isStudent ? (
          <Tag
            color={
              isOpening ? "processing" : isUpcoming ? "warning" : "default"
            }
          >
            {buttonLabel}
          </Tag>
        ) : (
          (!exam.examAttempt ||
            (exam.canResume && exam.examAttempt.status !== "SUBMITTED")) &&
          isOpening && (
            <Button
              className="mt-2"
              size="medium"
              color="primary"
              variant="contained"
              onClick={() => onStartExam(exam.id)}
            >
              {exam.examAttempt
                ? t("courseElement.classwork.status.resume")
                : buttonLabel}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

interface CourseGroupExamPercentageCellProps {
  exam: StudentExam;
}

export function CourseGroupExamPercentageCell({
  exam,
}: CourseGroupExamPercentageCellProps) {
  const totalScore = exam.examAttempt?.totalScore;
  if (totalScore === null || totalScore === undefined) return "---";

  const percent = Math.round((Number(totalScore) / 10) * 100);

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-action-hover">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor(percent)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="min-w-[40px] text-left font-medium text-text-primary">
        {percent}%
      </span>
    </div>
  );
}

interface CourseGroupExamScoreCellProps {
  exam: StudentExam;
}

export function CourseGroupExamScoreCell({
  exam,
}: CourseGroupExamScoreCellProps) {
  return exam.examAttempt?.totalScore ?? "---";
}

interface CourseGroupExamDurationCellProps {
  exam: StudentExam;
  onViewResult: (examAttemptId: number) => void;
}

export function CourseGroupExamDurationCell({
  exam,
  onViewResult,
}: CourseGroupExamDurationCellProps) {
  const { t, i18n } = useTranslation();
  const attempt = exam.examAttempt;
  if (!attempt) return "---";

  const duration = calculateDuration(
    attempt.startTime,
    attempt.submissionTime,
    i18n.resolvedLanguage ?? i18n.language
  );
  const isSubmitted = attempt.status === "SUBMITTED";
  const attemptId = attempt.id;

  return (
    <div className="flex items-center justify-between gap-4 pl-4">
      <span className="text-body-2 text-text-primary">{duration}</span>
      {isSubmitted && attemptId && (
        <Button
          variant="contained"
          color="success"
          size="medium"
          onClick={() => onViewResult(attemptId)}
        >
          {t("common.result")}
        </Button>
      )}
    </div>
  );
}
