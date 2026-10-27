import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui";
import { calculateDuration } from "@/features/assessments/utils/exam";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";
import { useTranslation } from "react-i18next";
import ExamResultSummaryCard, {
  type ExamResultSummaryStats,
} from "@/features/assessments/components/exam/ExamResultSummaryCard";
import ExamResultQuestionReview from "@/features/assessments/components/exam/ExamResultQuestionReview";

interface ExamResultOverviewProps {
  onCancel?: () => void;
}

export default function ExamResultOverview({
  onCancel,
}: ExamResultOverviewProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const { examResult, mode, answers } = useExamSessionStore();
  const { testData } = useExamDraftStore();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const isPreview = mode === "PREVIEW";
  const configuration = testData?.examConfiguration;
  const [showDetail, setShowDetail] = useState(false);

  const stats = useMemo<ExamResultSummaryStats | null>(() => {
    if (!examResult) return null;

    const { examAttempt } = examResult;
    const notAvailableLabel = t("examResultOverview.notAvailable");

    return {
      score: examAttempt.totalScore || 0,
      percentage: Math.round(((examAttempt.totalScore || 0) / 10) * 100),
      totalPoints: 10,
      durationText: calculateDuration(
        examAttempt.startTime,
        examAttempt.submissionTime,
        locale
      ),
      violationCount: examAttempt.examAttemptLog?.tabSwitchCount || 0,
      dateStarted: examAttempt.startTime
        ? new Date(examAttempt.startTime).toLocaleString(locale)
        : notAvailableLabel,
      dateFinished: examAttempt.submissionTime
        ? new Date(examAttempt.submissionTime).toLocaleString(locale)
        : notAvailableLabel,
    };
  }, [examResult, locale, t]);

  if (!examResult || !stats) {
    return (
      <div className="p-10 text-center">{t("examResultOverview.loading")}</div>
    );
  }

  const roleKind = getAuthenticatedRoleKind(user, role);
  const canShowDetails =
    configuration?.showDetailResults ||
    (!configuration?.showDetailResults &&
      !isPreview &&
      (roleKind === "ADMIN" ||
        roleKind === "TEACHER" ||
        roleKind === "CUSTOM"));

  const handleBackHome = () => navigate(-2);

  return (
    <div className="w-[668px] max-w-[668px] space-y-6">
      <ExamResultSummaryCard
        examName={testData?.examName}
        studentName={user?.profile.fullName}
        stats={stats}
        showScore={Boolean(configuration?.showScore || isPreview)}
        showPercentage={Boolean(configuration?.showScore)}
        canPrint={configuration?.allowPrint !== false || isPreview}
        violationLimit={configuration?.tabSwitchLimit ?? 3}
      />

      <ExamResultQuestionReview
        isVisible={showDetail}
        resultQuestions={examResult.questions}
        examQuestions={testData?.questions}
        answers={answers}
      />

      <div className="flex justify-end gap-4 pt-2">
        <Button variant="outline" onClick={onCancel ?? handleBackHome}>
          {t("examResultOverview.actions.exit")}
        </Button>
        {canShowDetails && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => setShowDetail((isVisible) => !isVisible)}
          >
            {showDetail
              ? t("examResultOverview.actions.hideDetail")
              : t("examResultOverview.actions.showDetail")}
          </Button>
        )}
      </div>
    </div>
  );
}
