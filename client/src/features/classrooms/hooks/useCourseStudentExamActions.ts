import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { examService } from "@/features/assessments/api/exam.service";
import { useExamActions } from "@/features/assessments/hooks/useExamActions";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface UseCourseStudentExamActionsOptions {
  isStudent: boolean;
  canPreviewExam: boolean;
}

export const useCourseStudentExamActions = ({
  isStudent,
  canPreviewExam,
}: UseCourseStudentExamActionsOptions) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reviewExam } = useExamActions();
  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const handleStartExam = async (examId: number) => {
    if (!isStudent) return;

    startLoading();
    try {
      const response = await examService.getExamById(examId);
      if (!response.data) return;

      useExamDraftStore.getState().updateTestData(response.data);
      navigate(`/tests/${examId}/take`);
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("courseElement.loadExamError"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleViewResult = async (examAttemptId: number) => {
    if (!isStudent) return;

    useExamSessionStore.getState().setMode("STUDENT");
    startLoading();
    try {
      await reviewExam(examAttemptId);
      setIsResultModalOpen(true);
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("courseElement.loadResultError"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handlePreviewExam = async (examId: number) => {
    if (!canPreviewExam) return;

    startLoading();
    try {
      const response = await examService.getExamById(examId);
      if (!response.data) return;

      useExamDraftStore.getState().updateTestData(response.data);
      const session = useExamSessionStore.getState();
      session.resetExam();
      session.setMode("PREVIEW");
      navigate(`/tests/${examId}/take?mode=preview`);
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("courseElement.loadExamError"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const closeResultModal = () => setIsResultModalOpen(false);

  return {
    isResultModalOpen,
    closeResultModal,
    handleStartExam,
    handleViewResult,
    handlePreviewExam,
  };
};
