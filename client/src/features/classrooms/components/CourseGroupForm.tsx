import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { BookOpenCheck } from "lucide-react";
import CourseGroupFormFields from "@/features/classrooms/components/CourseGroupFormFields";
import { useCourseGroupFormController } from "@/features/classrooms/hooks/useCourseGroupFormController";
import type { CourseGroupFormData } from "@/features/classrooms/types/courseGroupForm";
import { AppDialog, Button } from "@/shared/components/ui";

export type { CourseGroupFormData } from "@/features/classrooms/types/courseGroupForm";

interface CourseGroupFormProps {
  initialData?: Partial<CourseGroupFormData> | null;
  onSave: (data: CourseGroupFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CourseGroupForm({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
}: CourseGroupFormProps) {
  const { t } = useTranslation();
  const controller = useCourseGroupFormController({
    initialData,
    onSave,
    isSubmitting,
  });

  return (
    <AppDialog
      open
      title={
        controller.isEdit
          ? t("courseGroup.form.updateTitle")
          : t("courseGroup.form.addTitle")
      }
      description={t(
        controller.isEdit
          ? "courseGroup.form.updateDescription"
          : "courseGroup.form.dialogDescription",
        {
          groupName: controller.initialValues.groupName,
          subjectName:
            initialData?.subject || t("courseGroup.subjectUnavailable"),
        }
      )}
      icon={<BookOpenCheck size={20} />}
      tone="primary"
      onClose={onCancel}
      busy={isSubmitting}
      width="min(880px, calc(100vw - 32px))"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("courseGroup.form.close")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            htmlType="submit"
            form="course-group-form"
            loading={isSubmitting}
            disabled={isSubmitting || controller.isSubmitDisabled}
          >
            {controller.isEdit
              ? t("courseGroup.form.update")
              : t("courseGroup.form.save")}
          </Button>
        </div>
      }
    >
      <Form
        id="course-group-form"
        form={controller.form}
        layout="vertical"
        initialValues={controller.initialValues}
        onFinish={controller.handleFinish}
        onValuesChange={controller.handleValuesChange}
      >
        <CourseGroupFormFields
          isAdmin={controller.isAdmin}
          isTeacher={controller.isTeacher}
          isSubmitting={isSubmitting}
          isFetchingTeachers={controller.isFetchingTeachers}
          isTeachersError={controller.isTeachersError}
          isFetchingSubjects={controller.isFetchingSubjects}
          isSubjectsError={controller.isSubjectsError}
          activeTeacherId={controller.activeTeacherId}
          teacherName={
            controller.user?.profile.fullName ?? controller.user?.username ?? ""
          }
          teachers={controller.teachers}
          subjectOptions={controller.subjectOptions}
          assignedSubjectIds={controller.assignedSubjectIds}
          onRetryTeachers={controller.refetchTeachers}
          onRetrySubjects={controller.refetchSubjects}
        />
      </Form>
    </AppDialog>
  );
}
