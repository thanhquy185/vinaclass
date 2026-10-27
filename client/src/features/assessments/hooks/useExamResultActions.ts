import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import type { Exam } from "@/shared/types";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import type {
  ResultViewMode,
  StudentResultRow,
} from "@/features/assessments/utils/buildResultTableData";
import type { ClassScoreExportMetadata } from "@/features/assessments/utils/exportClassScores";

type ReviewExamAction = (examAttemptId: number) => Promise<unknown>;

interface UseExamResultActionsOptions {
  examId: number;
  exam?: Exam;
  reviewExam: ReviewExamAction;
  viewMode: ResultViewMode;
  studentRows: StudentResultRow[];
  exportMetadata: ClassScoreExportMetadata;
}

export function useExamResultActions({
  examId,
  exam,
  reviewExam,
  viewMode,
  studentRows,
  exportMetadata,
}: UseExamResultActionsOptions) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);
  const startLoading = useLoadingStore((state) => state.startLoading);
  const stopLoading = useLoadingStore((state) => state.stopLoading);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const handleStartExam = () => {
    if (!Number.isInteger(examId) || examId <= 0 || !exam?.questions?.length)
      return;

    useExamDraftStore.getState().setTestData(exam);
    const examSession = useExamSessionStore.getState();
    examSession.resetExam();
    examSession.setMode("PREVIEW");
    examSession.setPreviewReturnTo(`${pathname}${search}`);
    navigate(`/tests/${examId}/take?mode=preview`);
  };

  const handleViewResult = async (examAttemptId: number) => {
    useExamSessionStore.getState().setMode("STUDENT");

    try {
      startLoading();
      await reviewExam(examAttemptId);
      setIsResultModalOpen(true);
    } catch (error: unknown) {
      console.error("Failed to load exam result:", error);
      showToast(
        getApiErrorMessage(error) ?? t("resultPage.loadResultError"),
        "error",
      );
    } finally {
      stopLoading();
    }
  };

  const handleExportScores = async () => {
    if (viewMode !== "user" || studentRows.length === 0) {
      return;
    }

    try {
      const { exportClassScores } =
        await import("@/features/assessments/utils/exportClassScores");
      exportClassScores(
        studentRows.map((student) => ({
          username: student.username,
          fullName: student.fullName,
          totalScore: student.examAttempt?.totalScore,
        })),
        exportMetadata,
      );
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("resultPage.exportError"),
        "error",
      );
    }
  };

  return {
    isResultModalOpen,
    closeResultModal: () => setIsResultModalOpen(false),
    handleStartExam,
    handleViewResult,
    handleExportScores,
  };
}
