import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDeleteExam } from "@/features/assessments/hooks/useExamMutations";
import { getTestsStatus } from "@/features/assessments/utils/exam";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import type { StatusVariant } from "@/shared/components/ui/StatusLabel/StatusLabel";
import type { Exam } from "@/shared/types";

interface UseExamListItemControllerOptions {
  exam: Exam;
}

export function useExamListItemController({
  exam,
}: UseExamListItemControllerOptions) {
  const [now, setNow] = useState(() => new Date());
  const navigate = useNavigate();
  const { t } = useTranslation();
  const updateTestData = useExamDraftStore((state) => state.updateTestData);
  const { mutateAsync: deleteExam } = useDeleteExam();
  const { startLoading, stopLoading } = useLoadingStore();
  const openConfirm = useConfirmation();
  const { showToast } = useToastStore();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const status = getTestsStatus(exam.startTime, exam.endTime, now);
  const statusLabel =
    status.status === "OPENING"
      ? t("testPage.filter.opening")
      : status.status === "UPCOMING"
        ? t("testPage.filter.notOpened")
        : t("testPage.filter.closed");
  const statusVariant: StatusVariant =
    status.status === "OPENING"
      ? "warning"
      : status.status === "UPCOMING"
        ? "success"
        : "error";

  const handleJoinTest = () => {
    updateTestData({ ...exam });
    navigate(`${exam.id}/view`);
  };

  const handleEditTest = () => {
    updateTestData({ ...exam });
    navigate(`${exam.id}/edit`);
  };

  const handleOpenDetails = () => navigate(`${exam.id}`);

  const handleDelete = () => {
    openConfirm({
      title: t("testItem.confirmDeleteTitle"),
      message: t("testItem.confirmDelete"),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        try {
          await deleteExam(exam.id);
          showToast(t("message.success.delete"), "success");
        } catch (error: unknown) {
          showToast(
            getApiErrorMessage(error) ?? t("message.error.delete"),
            "error"
          );
        } finally {
          stopLoading();
        }
      },
    });
  };

  return {
    statusLabel,
    statusVariant,
    handleJoinTest,
    handleEditTest,
    handleOpenDetails,
    handleDelete,
  };
}
