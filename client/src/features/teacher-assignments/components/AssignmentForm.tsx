import { Form } from "antd";
import { BookOpenCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  AssignmentRequest,
  TeacherSubject,
} from "@/features/teacher-assignments/types/teacherAssignment";
import AssignmentFormFields from "@/features/teacher-assignments/components/AssignmentFormFields";
import { useAssignmentFormController } from "@/features/teacher-assignments/hooks/useAssignmentFormController";
import { AppDialog, Button } from "@/shared/components/ui";

const FORM_ID = "teacher-assignment-form";

interface AddAssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AssignmentRequest) => Promise<void>;
  assignments: TeacherSubject[];
  isSaving?: boolean;
}

export default function AddAssignmentForm({
  isOpen,
  onClose,
  onSave,
  assignments,
  isSaving = false,
}: AddAssignmentFormProps) {
  const { t } = useTranslation();
  const controller = useAssignmentFormController({
    isOpen,
    assignments,
    onSave,
  });

  if (!isOpen) return null;

  return (
    <AppDialog
      open={isOpen}
      onClose={onClose}
      title={t("addAssignmentForm.title")}
      description={t("addAssignmentForm.description")}
      icon={<BookOpenCheck size={23} aria-hidden="true" />}
      tone="primary"
      width="min(1000px, calc(100vw - 32px))"
      busy={isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onClose}
            disabled={isSaving}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            htmlType="submit"
            form={FORM_ID}
            className="min-w-32"
            loading={isSaving}
            disabled={
              isSaving ||
              !controller.teacherId ||
              controller.isLoadingSubjects ||
              controller.isLoadingTeachers ||
              controller.isSubjectsError ||
              controller.isTeachersError
            }
          >
            {t("common.saveAssignment")}
          </Button>
        </div>
      }
    >
      <Form
        id={FORM_ID}
        autoComplete="off"
        form={controller.form}
        initialValues={{ teacherId: null, subjectIds: [] }}
        onFinish={controller.handleSubmit}
        layout="vertical"
      >
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <AssignmentFormFields
            form={controller.form}
            teacherId={controller.teacherId}
            subjectIds={controller.subjectIds}
            searchTerm={controller.searchTerm}
            teachers={controller.teachers}
            subjects={controller.filteredSubjects}
            isLoadingSubjects={controller.isLoadingSubjects}
            isLoadingTeachers={controller.isLoadingTeachers}
            isFetchingSubjects={controller.isFetchingSubjects}
            isFetchingTeachers={controller.isFetchingTeachers}
            isSubjectsError={controller.isSubjectsError}
            isTeachersError={controller.isTeachersError}
            isSaving={isSaving}
            allVisibleSelected={controller.allVisibleSelected}
            someVisibleSelected={controller.someVisibleSelected}
            onSearchTermChange={controller.setSearchTerm}
            onRetrySubjects={controller.refetchSubjects}
            onRetryTeachers={controller.refetchTeachers}
            onTeacherChange={controller.handleTeacherSelect}
            onToggleVisibleSubjects={controller.handleVisibleSubjectsCheck}
            onToggleSubject={controller.handleSubjectCheck}
          />
        </div>
      </Form>
    </AppDialog>
  );
}
