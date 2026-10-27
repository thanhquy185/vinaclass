import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDeleteExam } from "@/features/assessments/hooks/useExamMutations";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useLocation } from "react-router-dom";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import type { Exam } from "@/shared/types";

export function useTestDetailActions(exam?: Partial<Exam>) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { t } = useTranslation();
  const { mutateAsync: deleteExam } = useDeleteExam();
  const showToast = useToastStore((state) => state.showToast);
  const openConfirm = useConfirmation();

  const handlePreview = () => {
    if (!exam?.id || !exam.questions?.length) return;

    useExamDraftStore.getState().setTestData(exam);
    const examStore = useExamSessionStore.getState();
    examStore.resetExam();
    examStore.setMode("PREVIEW");
    examStore.setPreviewReturnTo(`${pathname}${search}`);
    navigate("take?mode=preview");
  };

  const handleEdit = () => {
    if (exam) useExamDraftStore.getState().setTestData(exam);
    navigate("edit");
  };
  const handleView = () => {
    if (exam) useExamDraftStore.getState().setTestData(exam);
    navigate("view");
  };
  const handleBackToList = () => navigate("/tests");

  const handleDelete = () => {
    const examId = exam?.id;
    if (!examId) return;

    openConfirm({
      title: t("testDetailPage.deleteConfirmTitle"),
      message: t("testDetailPage.deleteConfirm"),
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteExam(examId);
        } catch (error: unknown) {
          showToast(
            getApiErrorMessage(error) ?? t("message.error.delete"),
            "error",
          );
          return;
        }

        handleBackToList();
      },
    });
  };

  return {
    handlePreview,
    handleEdit,
    handleView,
    handleDelete,
    handleBackToList,
  };
}
