import { useTranslation } from "react-i18next";
import type {
  AssignmentRequest,
  TeacherAssignmentRemoval,
} from "@/features/teacher-assignments/types/teacherAssignment";
import {
  getApiErrorMessage,
  getApiValidationMessage,
} from "@/shared/utils/apiError";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseTeacherAssignmentActionsOptions {
  syncAssignments: (data: AssignmentRequest) => Promise<unknown>;
  deleteAssignment: (variables: {
    teacherId: number;
    subjectId: number;
  }) => Promise<unknown>;
  onSaved: () => void;
}

export const useTeacherAssignmentActions = ({
  syncAssignments,
  deleteAssignment,
  onSaved,
}: UseTeacherAssignmentActionsOptions) => {
  const { t } = useTranslation("common");
  const { startLoading, stopLoading } = useLoadingStore();
  const showToast = useToastStore((state) => state.showToast);
  const openConfirm = useConfirmation();

  const handleSave = async (data: AssignmentRequest) => {
    startLoading();
    try {
      await syncAssignments(data);
      onSaved();
      showToast(t("message.success.create"), "success");
    } catch (error: unknown) {
      showToast(
        getApiValidationMessage(error) ?? t("message.error.create"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleDelete = (assignment: TeacherAssignmentRemoval) => {
    openConfirm({
      title: t("assignmentPage.confirmDeleteTitle"),
      message: t("assignmentPage.confirmDelete", {
        teacherName: assignment.teacherName,
        subjectName: assignment.subjectName,
      }),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        try {
          await deleteAssignment({
            teacherId: assignment.teacherId,
            subjectId: assignment.subjectId,
          });
          showToast(t("message.success.delete"), "success");
        } catch (error: unknown) {
          showToast(
            getApiErrorMessage(error) ?? t("message.error.delete"),
            "error"
          );
          throw error;
        } finally {
          stopLoading();
        }
      },
    });
  };

  return { handleSave, handleDelete };
};
