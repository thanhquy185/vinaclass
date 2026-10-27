import { useTranslation } from "react-i18next";
import {
  useCopyQuestionToPrivate,
  useCreateQuestion,
  useDeleteQuestion,
  useUpdateQuestion,
  useUpdateQuestionStatus,
} from "@/features/question-bank/hooks/useQuestionMutations";
import type { QuestionCreate, QuestionUpdate } from "@/shared/types";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseQuestionBankActionsOptions {
  creatorId?: number;
  onQuestionSaved: () => void;
  onQuestionCreated: () => void;
}

export const useQuestionBankActions = ({
  creatorId,
  onQuestionSaved,
  onQuestionCreated,
}: UseQuestionBankActionsOptions) => {
  const { t } = useTranslation();
  const { showToast } = useToastStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const openConfirm = useConfirmation();

  const { createQuestion, isCreating } = useCreateQuestion();
  const { updateQuestion, isUpdating } = useUpdateQuestion();
  const { deleteQuestion, isDeleting } = useDeleteQuestion();
  const { copyQuestion, isCopying } = useCopyQuestionToPrivate();
  const {
    publicQuestionAsync,
    archiveQuestionAsync,
    restoreQuestionAsync,
    moveToPrivateAsync,
    isUpdatingStatus,
  } = useUpdateQuestionStatus();

  const isProcessing =
    isCreating || isUpdating || isDeleting || isCopying || isUpdatingStatus;

  const handleCreate = async (data: QuestionCreate) => {
    startLoading();
    try {
      await createQuestion(data);
      onQuestionCreated();
      showToast(t("message.success.create"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.create"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleUpdate = async (id: number, data: QuestionUpdate) => {
    startLoading();
    try {
      await updateQuestion({ questionId: id, data });
      onQuestionSaved();
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.update"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleDelete = (id: number) => {
    openConfirm({
      title: t("questionPage.deleteConfirm.title"),
      message: t("questionPage.deleteConfirm.message"),
      type: "danger",
      confirmLabel: t("questionPage.deleteConfirm.confirm"),
      cancelLabel: t("questionPage.deleteConfirm.cancel"),
      onConfirm: async () => {
        startLoading();
        try {
          await deleteQuestion(id);
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

  const handleCopyToBank = async (id: number) => {
    if (creatorId == null) {
      showToast(t("message.error.create"), "error");
      return;
    }

    startLoading();
    try {
      await copyQuestion({ questionId: id, data: { creatorId } });
      showToast(t("questionPage.toast.addToBank"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.create"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const runStatusUpdate = async (operation: () => Promise<unknown>) => {
    startLoading();
    try {
      await operation();
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.update"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  return {
    isProcessing,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleCopyToBank,
    handlePublicQuestion: (questionId: number) =>
      runStatusUpdate(() => publicQuestionAsync(questionId)),
    handleArchiveQuestion: (questionId: number) =>
      runStatusUpdate(() => archiveQuestionAsync(questionId)),
    handleRestoreQuestion: (questionId: number) =>
      runStatusUpdate(() => restoreQuestionAsync(questionId)),
    handleMoveToPrivateQuestion: (questionId: number) =>
      runStatusUpdate(() => moveToPrivateAsync(questionId)),
  };
};
