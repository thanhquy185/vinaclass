import { useState } from "react";
import { useCourseRosterImportController } from "@/features/classrooms/hooks/useCourseRosterImportController";
import { useManualStudentEnrollmentController } from "@/features/classrooms/hooks/useManualStudentEnrollmentController";

interface UseCourseRosterFormControllerOptions {
  groupId: number;
  onClose: () => void;
}

export function useCourseRosterFormController({
  groupId,
  onClose,
}: UseCourseRosterFormControllerOptions) {
  const [selectedTab, setSelectedTab] = useState("manual");
  const manualEnrollment = useManualStudentEnrollmentController({
    groupId,
    onClose,
  });
  const rosterImport = useCourseRosterImportController({ groupId, onClose });
  const isBusy = manualEnrollment.isAdding || rosterImport.isImporting;

  const handleClose = () => {
    if (isBusy) return;

    manualEnrollment.reset();
    rosterImport.reset();
    onClose();
  };

  return {
    studentForm: manualEnrollment.studentForm,
    importForm: rosterImport.importForm,
    selectedTab,
    setSelectedTab,
    selectedFile: rosterImport.selectedFile,
    isBusy,
    isAdding: manualEnrollment.isAdding,
    isImporting: rosterImport.isImporting,
    handleBeforeUpload: rosterImport.handleBeforeUpload,
    handleRemoveFile: rosterImport.handleRemoveFile,
    handleImportStudents: rosterImport.handleImportStudents,
    handleAddStudent: manualEnrollment.handleAddStudent,
    handleClose,
  };
}
