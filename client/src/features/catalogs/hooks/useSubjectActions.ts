import { useTranslation } from "react-i18next";
import type {
  ApiResponse,
  Chapter,
  ChapterListRequest,
  SubjectRequest,
  SubjectWithChapters,
  SubjectUpdateRequest,
} from "@/shared/types";
import {
  getApiErrorMessage,
  getApiValidationMessage,
  hasApiFieldError,
  getApiErrorDetails,
} from "@/shared/utils/apiError";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseSubjectActionsOptions {
  createSubject: (data: SubjectRequest) => Promise<unknown>;
  updateSubject: (variables: {
    subjectId: number;
    data: SubjectUpdateRequest;
  }) => Promise<unknown>;
  deleteSubject: (subjectId: number) => Promise<unknown>;
  updateSubjectChapters: (variables: {
    subjectId: number;
    data: ChapterListRequest;
  }) => Promise<ApiResponse<SubjectWithChapters>>;
}

export function useSubjectActions({
  createSubject,
  updateSubject,
  deleteSubject,
  updateSubjectChapters,
}: UseSubjectActionsOptions) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);

  const handleCreate = async (data: SubjectRequest): Promise<boolean> => {
    try {
      await createSubject(data);
      showToast(t("message.success.create"), "success");
      return true;
    } catch (error) {
      const details = getApiErrorDetails(error);
      const message =
        details.status === 422 &&
        hasApiFieldError(details.errors, "subjectCode")
          ? t("subjectPage.form.validation.codeExists")
          : getApiValidationMessage(error) ?? t("message.error.create");
      showToast(message, "error");
      return false;
    }
  };

  const handleUpdate = async (
    subjectId: number,
    data: SubjectUpdateRequest,
  ): Promise<boolean> => {
    try {
      await updateSubject({ subjectId, data });
      showToast(t("message.success.update"), "success");
      return true;
    } catch (error) {
      showToast(
        getApiValidationMessage(error) ?? t("message.error.update"),
        "error",
      );
      return false;
    }
  };

  const handleSaveChapters = async (
    subjectId: number,
    data: ChapterListRequest,
  ): Promise<Chapter[] | null> => {
    try {
      const response = await updateSubjectChapters({ subjectId, data });
      showToast(t("subjectPage.chapters.saved"), "success");
      return response.data.chapters;
    } catch (error) {
      showToast(
        getApiValidationMessage(error) ?? t("subjectPage.chapters.saveFailed"),
        "error",
      );
      return null;
    }
  };

  const handleDelete = async (subjectId: number): Promise<boolean> => {
    try {
      await deleteSubject(subjectId);
      showToast(t("message.success.delete"), "success");
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.delete"),
        "error",
      );
      return false;
    }
  };

  return { handleCreate, handleUpdate, handleSaveChapters, handleDelete };
}
