import { App } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { examDetailQueryOptions } from "@/features/assessments/queryOptions";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useTranslation } from "react-i18next";

export function useStudentExamActions(canViewExams: boolean) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const { message } = App.useApp();
  const { t } = useTranslation();

  const handleStartExam = async (examId: number) => {
    if (!canViewExams) return;

    try {
      const exam = await queryClient.fetchQuery(
        examDetailQueryOptions(examId, userId)
      );

      if (exam) {
        useExamDraftStore.getState().updateTestData(exam);
        navigate(`/tests/${examId}/take`);
      }
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error) ?? t("examPage.loadExamError"));
    }
  };

  return { handleStartExam };
}
