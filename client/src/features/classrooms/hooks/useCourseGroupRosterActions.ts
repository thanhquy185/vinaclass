import { useTranslation } from "react-i18next";
import type { StudentRecord } from "@/shared/types";
import {
  useExportCourseGroupStudents,
  useRemoveStudentFromCourseGroup,
} from "@/features/classrooms/hooks/useCourseGroupMutations";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface UseCourseGroupRosterActionsOptions {
  groupId: number;
}

export function useCourseGroupRosterActions({
  groupId,
}: UseCourseGroupRosterActionsOptions) {
  const { t } = useTranslation("common");
  const openConfirm = useConfirmation();
  const showToast = useToastStore((state) => state.showToast);
  const removeMutation = useRemoveStudentFromCourseGroup();
  const exportMutation = useExportCourseGroupStudents();

  const handleExportStudentList = async () => {
    try {
      await exportMutation.mutateAsync({ groupId });
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("courseGroupStudent.exportError"),
        "error"
      );
    }
  };

  const handleRemoveStudent = (student: StudentRecord) => {
    openConfirm({
      title: t("courseGroupStudent.confirmRemoveTitle"),
      message: t("courseGroupStudent.confirmRemoveStudent", {
        studentName: student.fullName,
      }),
      type: "danger",
      onConfirm: async () => {
        try {
          await removeMutation.mutateAsync({
            groupId,
            studentId: student.id,
          });
          showToast(t("message.success.delete"), "success");
        } catch (error: unknown) {
          showToast(
            getApiErrorMessage(error) ?? t("message.error.delete"),
            "error"
          );
          throw error;
        }
      },
    });
  };

  return {
    isExporting: exportMutation.isPending,
    isRemovingStudent: removeMutation.isPending,
    handleExportStudentList,
    handleRemoveStudent,
  };
}
