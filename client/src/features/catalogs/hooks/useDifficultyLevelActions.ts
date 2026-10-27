import { useTranslation } from "react-i18next";
import type { DifficultyRequest } from "@/shared/types";
import {
  getApiErrorDetails,
  getApiErrorMessage,
  getApiValidationMessage,
  hasApiFieldError,
} from "@/shared/utils/apiError";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseDifficultyLevelActionsOptions {
  createDifficulty: (data: DifficultyRequest) => Promise<unknown>;
  updateDifficulty: (variables: {
    difficultyId: number;
    data: DifficultyRequest;
  }) => Promise<unknown>;
  deleteDifficulty: (difficultyId: number) => Promise<unknown>;
  onSaved: () => void;
}

export function useDifficultyLevelActions({
  createDifficulty,
  updateDifficulty,
  deleteDifficulty,
  onSaved,
}: UseDifficultyLevelActionsOptions) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);

  const getSaveErrorMessage = (
    error: unknown,
    operation: "create" | "update",
  ) => {
    const details = getApiErrorDetails(error);
    if (
      details.status === 422 &&
      hasApiFieldError(details.errors, "difficultyName")
    ) {
      return t("difficultyLevelPage.form.validation.nameExists");
    }

    return getApiValidationMessage(error) ?? t(`message.error.${operation}`);
  };

  const handleCreate = async (data: DifficultyRequest): Promise<boolean> => {
    try {
      await createDifficulty({ difficultyName: data.difficultyName.trim() });
      showToast(t("message.success.create"), "success");
      onSaved();
      return true;
    } catch (error) {
      showToast(getSaveErrorMessage(error, "create"), "error");
      return false;
    }
  };

  const handleUpdate = async (
    difficultyId: number,
    data: DifficultyRequest,
  ): Promise<boolean> => {
    try {
      await updateDifficulty({
        difficultyId,
        data: { difficultyName: data.difficultyName.trim() },
      });
      showToast(t("message.success.update"), "success");
      onSaved();
      return true;
    } catch (error) {
      showToast(getSaveErrorMessage(error, "update"), "error");
      return false;
    }
  };

  const handleDelete = async (difficultyId: number): Promise<boolean> => {
    try {
      await deleteDifficulty(difficultyId);
      showToast(t("message.success.delete"), "success");
      onSaved();
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.delete"),
        "error",
      );
      return false;
    }
  };

  return { handleCreate, handleUpdate, handleDelete };
}
