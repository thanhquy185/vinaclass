import { Form } from "antd";
import type { UploadProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useImportCourseGroupStudents } from "@/features/classrooms/hooks/useCourseGroupMutations";
import type { StudentRosterImportValues } from "@/features/classrooms/types/courseRoster";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  getApiErrorDetails,
  getApiErrorMessage,
} from "@/shared/utils/apiError";

interface UseCourseRosterImportControllerOptions {
  groupId: number;
  onClose: () => void;
}

export function useCourseRosterImportController({
  groupId,
  onClose,
}: UseCourseRosterImportControllerOptions) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const importMutation = useImportCourseGroupStudents();
  const [importForm] = Form.useForm<StudentRosterImportValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetImportForm = () => {
    setSelectedFile(null);
    importForm.resetFields();
  };

  const handleBeforeUpload: UploadProps["beforeUpload"] = (file) => {
    setSelectedFile(file);
    importForm.setFieldsValue({ studentFile: file.name });
    importForm.setFields([{ name: "studentFile", errors: [] }]);
    return false;
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    importForm.resetFields(["studentFile"]);
  };

  async function handleImportStudents() {
    const file = selectedFile;
    if (!file) return;

    try {
      const response = await importMutation.mutateAsync({ groupId, file });
      const { count, missing } = response.data;

      if (missing.length > 0) {
        const studentCodes = missing
          .slice(0, 3)
          .map(({ username }) => username)
          .join(", ");
        showToast(
          t("courseGroupStudent.form.importPartialSuccess", {
            added: count,
            missing: missing.length,
            studentCodes,
          }),
          "warning"
        );
      } else if (count > 0) {
        showToast(
          t("courseGroupStudent.form.importSuccess", { count }),
          "success"
        );
      } else {
        showToast(t("courseGroupStudent.form.importNoChanges"), "info");
      }

      resetImportForm();
      onClose();
    } catch (error: unknown) {
      const details = getApiErrorDetails(error);
      const missingStudents = Array.isArray(details.rawErrors)
        ? details.rawErrors.filter(
            (item): item is Record<string, unknown> =>
              typeof item === "object" &&
              item !== null &&
              typeof item.username === "string"
          )
        : [];

      if (missingStudents.length > 0) {
        const studentCodes = missingStudents
          .slice(0, 3)
          .map((student) => student.username)
          .join(", ");
        showToast(
          t("courseGroupStudent.form.importNoAccountsFound", {
            count: missingStudents.length,
            studentCodes,
          }),
          "error"
        );
      } else {
        showToast(
          getApiErrorMessage(error) ?? t("courseGroupStudent.form.importError"),
          "error"
        );
      }
    }
  }

  return {
    importForm,
    selectedFile,
    isImporting: importMutation.isPending,
    handleBeforeUpload,
    handleRemoveFile,
    handleImportStudents,
    reset: resetImportForm,
  };
}
