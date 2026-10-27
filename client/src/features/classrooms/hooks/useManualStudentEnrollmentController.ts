import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { useAddStudentToCourseGroup } from "@/features/classrooms/hooks/useCourseGroupMutations";
import type { StudentEnrollmentFormValues } from "@/features/classrooms/types/courseRoster";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface UseManualStudentEnrollmentControllerOptions {
  groupId: number;
  onClose: () => void;
}

export function useManualStudentEnrollmentController({
  groupId,
  onClose,
}: UseManualStudentEnrollmentControllerOptions) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const addMutation = useAddStudentToCourseGroup();
  const [studentForm] = Form.useForm<StudentEnrollmentFormValues>();

  async function handleAddStudent(values: StudentEnrollmentFormValues) {
    const username = values.studentCode.trim();

    try {
      await addMutation.mutateAsync({ id: groupId, data: { username } });
      showToast(t("message.success.create"), "success");
      studentForm.resetFields();
      onClose();
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.create"),
        "error"
      );
    }
  }

  return {
    studentForm,
    isAdding: addMutation.isPending,
    handleAddStudent,
    reset: () => studentForm.resetFields(),
  };
}
