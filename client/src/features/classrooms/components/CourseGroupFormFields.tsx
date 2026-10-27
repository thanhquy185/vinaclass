import { Form, Input, InputNumber, Select } from "antd";
import type { User } from "@/features/identity/types/identity";
import { AssignmentTeacherIdentity } from "@/features/teacher-assignments/components/AssignmentTeacherIdentity";
import { QueryErrorAlert } from "@/shared/components/ui/QueryErrorAlert/QueryErrorAlert";
import { useTranslation } from "react-i18next";
import { CourseGroupValidate } from "@/features/classrooms/utils/courseGroup.validate";
import { AdminFormField, AdminFormSection } from "@/shared/components/admin";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";
import {
  maxLengthRule,
  requiredFieldRule,
  translatedValidationRule,
} from "@/shared/utils/validation";

interface CourseGroupSubjectOption {
  label: string;
  value: number;
  subjectCode: string;
  subjectName: string;
}

interface CourseGroupFormFieldsProps {
  isAdmin: boolean;
  isTeacher: boolean;
  isSubmitting: boolean;
  isFetchingTeachers: boolean;
  isTeachersError: boolean;
  isFetchingSubjects: boolean;
  isSubjectsError: boolean;
  activeTeacherId: number | null | undefined;
  teacherName: string;
  teachers: User[];
  subjectOptions: CourseGroupSubjectOption[];
  assignedSubjectIds: number[];
  onRetryTeachers: () => void;
  onRetrySubjects: () => void;
}

export default function CourseGroupFormFields({
  isAdmin,
  isTeacher,
  isSubmitting,
  isFetchingTeachers,
  isTeachersError,
  isFetchingSubjects,
  isSubjectsError,
  activeTeacherId,
  teacherName,
  teachers,
  subjectOptions,
  assignedSubjectIds,
  onRetryTeachers,
  onRetrySubjects,
}: CourseGroupFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 px-5 py-5 sm:px-6">
      {isTeachersError && isAdmin && (
        <QueryErrorAlert
          message={t("courseGroup.form.teacherLoadError")}
          onRetry={onRetryTeachers}
          isRetrying={isFetchingTeachers}
          retryLabel={t("courseGroup.retry")}
        />
      )}
      {isSubjectsError && (
        <QueryErrorAlert
          message={t("courseGroup.form.subjectLoadError")}
          onRetry={onRetrySubjects}
          isRetrying={isFetchingSubjects}
          retryLabel={t("courseGroup.retry")}
        />
      )}

      <div className="space-y-6">
        <AdminFormSection title={t("courseGroup.form.classSection")}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminFormField
              name="groupName"
              label={t("courseGroup.form.groupName")}
              className="md:col-span-2"
              rules={[
                requiredFieldRule(
                  t("courseGroup.form.validation.groupNameRequired"),
                  { whitespace: true }
                ),
                maxLengthRule(
                  100,
                  t("courseGroup.form.validation.groupNameMaxLength")
                ),
              ]}
            >
              <Input
                autoFocus
                size="large"
                maxLength={100}
                placeholder={t("courseGroup.form.groupNamePlaceholder")}
                disabled={isSubmitting}
                className="!h-10 !rounded-lg !bg-background-paper !text-sm"
              />
            </AdminFormField>

            <AdminFormField
              name="note"
              label={t("courseGroup.form.note")}
              className="md:col-span-2"
            >
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 5 }}
                maxLength={1000}
                placeholder={t("courseGroup.form.notePlaceholder")}
                disabled={isSubmitting}
                className="!rounded-lg !bg-background-paper !text-sm"
              />
            </AdminFormField>
          </div>
        </AdminFormSection>

        <AdminFormSection title={t("courseGroup.form.courseTermSection")}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {isAdmin && (
              <AdminFormField
                name="teacherId"
                label={t("courseGroup.form.lecturer")}
                rules={[
                  requiredFieldRule(
                    t("courseGroup.form.validation.lecturerRequired")
                  ),
                ]}
              >
                <Select
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  loading={isFetchingTeachers}
                  disabled={
                    isSubmitting || isFetchingTeachers || isTeachersError
                  }
                  placeholder={t("courseGroup.form.lecturerPlaceholder")}
                  notFoundContent={t("courseGroup.form.noTeachers")}
                  options={teachers.map((teacher) => ({
                    label: teacher.profile.fullName || teacher.username,
                    value: Number(teacher.id),
                  }))}
                  filterOption={(input, option) => {
                    const teacher = teachers.find(
                      (candidate) => candidate.id === Number(option?.value)
                    );
                    if (!teacher) return false;

                    return normalizeSearchText(
                      [
                        teacher.profile.fullName,
                        teacher.username,
                        teacher.email,
                        teacher.teacherProfile?.teacherCode,
                        teacher.teacherProfile?.departmentName,
                        teacher.teacherProfile?.academicTitle,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    ).includes(normalizeSearchText(input.trim()));
                  }}
                  optionRender={(option) => {
                    const teacher = teachers.find(
                      (candidate) => candidate.id === Number(option.value)
                    );

                    return teacher ? (
                      <AssignmentTeacherIdentity teacher={teacher} />
                    ) : (
                      option.label
                    );
                  }}
                  labelRender={(option) => {
                    const teacher = teachers.find(
                      (candidate) => candidate.id === Number(option.value)
                    );

                    return teacher ? (
                      <AssignmentTeacherIdentity
                        teacher={teacher}
                        variant="selected"
                      />
                    ) : (
                      option.label
                    );
                  }}
                  className="w-full [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!w-full [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!py-1 [&_.ant-select-selector]:!h-auto [&_.ant-select-selector]:!min-h-16 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-background-paper [&_.ant-select-selector]:!px-3"
                />
              </AdminFormField>
            )}

            {isTeacher && (
              <>
                <Form.Item
                  name="teacherId"
                  hidden
                  rules={[
                    requiredFieldRule(
                      t("courseGroup.form.validation.lecturerRequired")
                    ),
                  ]}
                >
                  <Input />
                </Form.Item>
                <AdminFormField label={t("courseGroup.form.assignedTeacher")}>
                  <Input
                    value={teacherName}
                    disabled
                    size="large"
                    className="!h-10 !rounded-lg !bg-action-hover !text-sm"
                  />
                </AdminFormField>
              </>
            )}

            <AdminFormField
              name="subjectId"
              label={t("courseGroup.form.subject")}
              rules={[
                requiredFieldRule(
                  t("courseGroup.form.validation.subjectRequired")
                ),
                translatedValidationRule(
                  (value: number | null | undefined) =>
                    CourseGroupValidate.getSubjectAssignmentError(
                      value,
                      assignedSubjectIds
                    ),
                  t
                ),
              ]}
            >
              <Select
                size="large"
                showSearch
                optionFilterProp="label"
                loading={isFetchingSubjects}
                disabled={
                  isSubmitting ||
                  !activeTeacherId ||
                  isFetchingSubjects ||
                  isSubjectsError
                }
                placeholder={t("courseGroup.form.subjectPlaceholder")}
                notFoundContent={t("courseGroup.form.noAssignedSubjects")}
                options={subjectOptions}
                optionRender={(option) => {
                  const subject = subjectOptions.find(
                    (candidate) => candidate.value === Number(option.value)
                  );

                  return subject ? (
                    <div className="flex min-w-0 items-center gap-2.5 py-0.5">
                      <span className="bg-custom-background-primary-background shrink-0 rounded-md px-2 py-1 font-mono text-xs font-semibold text-primary-main">
                        {subject.subjectCode}
                      </span>
                      <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                        {subject.subjectName}
                      </span>
                    </div>
                  ) : (
                    option.label
                  );
                }}
                labelRender={(option) => {
                  const subject = subjectOptions.find(
                    (candidate) => candidate.value === Number(option.value)
                  );

                  return subject ? (
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="bg-custom-background-primary-background shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-semibold text-primary-main">
                        {subject.subjectCode}
                      </span>
                      <span className="truncate text-sm font-medium text-text-primary">
                        {subject.subjectName}
                      </span>
                    </span>
                  ) : (
                    option.label
                  );
                }}
                className="w-full [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center"
              />
            </AdminFormField>

            <AdminFormField
              name="academicYear"
              label={t("courseGroup.form.academicYear")}
              rules={[
                requiredFieldRule(
                  t("courseGroup.form.validation.academicYearMinimum")
                ),
                {
                  type: "integer",
                  min: 2000,
                  message: t("courseGroup.form.validation.academicYearMinimum"),
                },
              ]}
            >
              <InputNumber
                size="large"
                className="!h-10 !w-full !rounded-lg !bg-background-paper"
                min={2000}
                max={9999}
                precision={0}
                placeholder={t("courseGroup.form.academicYearPlaceholder")}
                disabled={isSubmitting}
              />
            </AdminFormField>

            <AdminFormField
              name="semester"
              label={t("courseGroup.form.semester")}
              rules={[
                requiredFieldRule(
                  t("courseGroup.form.validation.semesterInvalid")
                ),
                {
                  type: "enum",
                  enum: [1, 2],
                  message: t("courseGroup.form.validation.semesterInvalid"),
                },
              ]}
            >
              <Select
                size="large"
                disabled={isSubmitting}
                options={[1, 2].map((semester) => ({
                  value: semester,
                  label: String(semester),
                }))}
                className="w-full"
              />
            </AdminFormField>
          </div>
        </AdminFormSection>
      </div>
    </div>
  );
}
