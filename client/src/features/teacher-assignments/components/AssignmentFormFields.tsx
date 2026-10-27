import { Input, Select } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";
import type { Subject } from "@/shared/types";
import type { User } from "@/features/identity/types/identity";
import type { AssignmentRequest } from "@/features/teacher-assignments/types/teacherAssignment";
import { AssignmentValidate } from "@/features/teacher-assignments/utils/assignment.validate";
import AssignmentSubjectTable from "@/features/teacher-assignments/components/AssignmentSubjectTable";
import { AssignmentTeacherIdentity } from "@/features/teacher-assignments/components/AssignmentTeacherIdentity";
import { QueryErrorAlert } from "@/shared/components/ui/QueryErrorAlert/QueryErrorAlert";
import { FormField } from "@/shared/components/ui";
import {
  AdminFormField,
  AdminFormSection,
} from "@/shared/components/admin";
import {
  requiredFieldRule,
  translatedValidationRule,
} from "@/shared/utils/validation";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

interface AssignmentFormFieldsProps {
  form: FormInstance<AssignmentRequest>;
  teacherId: number | null;
  subjectIds: number[];
  searchTerm: string;
  teachers: User[];
  subjects: Subject[];
  isLoadingSubjects: boolean;
  isLoadingTeachers: boolean;
  isFetchingSubjects: boolean;
  isFetchingTeachers: boolean;
  isSubjectsError: boolean;
  isTeachersError: boolean;
  isSaving: boolean;
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  onSearchTermChange: (value: string) => void;
  onRetrySubjects: () => void | Promise<unknown>;
  onRetryTeachers: () => void | Promise<unknown>;
  onTeacherChange: (teacherId?: number) => void;
  onToggleVisibleSubjects: (checked: boolean) => void;
  onToggleSubject: (subjectId: number, checked: boolean) => void;
}

export default function AssignmentFormFields({
  form,
  teacherId,
  subjectIds,
  searchTerm,
  teachers,
  subjects,
  isLoadingSubjects,
  isLoadingTeachers,
  isFetchingSubjects,
  isFetchingTeachers,
  isSubjectsError,
  isTeachersError,
  isSaving,
  allVisibleSelected,
  someVisibleSelected,
  onSearchTermChange,
  onRetrySubjects,
  onRetryTeachers,
  onTeacherChange,
  onToggleVisibleSubjects,
  onToggleSubject,
}: AssignmentFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {(isTeachersError || isSubjectsError) && (
        <div className="space-y-2">
          {isTeachersError && (
            <QueryErrorAlert
              message={t("addAssignmentForm.teacherLoadError")}
              onRetry={onRetryTeachers}
              isRetrying={isFetchingTeachers}
            />
          )}
          {isSubjectsError && (
            <QueryErrorAlert
              message={t("addAssignmentForm.subjectLoadError")}
              onRetry={onRetrySubjects}
              isRetrying={isFetchingSubjects}
            />
          )}
        </div>
      )}

      <AdminFormSection
        title={t("addAssignmentForm.teacherSection")}
        description={t("addAssignmentForm.teacherDescription")}
      >
        <AdminFormField
          label={t("addAssignmentForm.teacher")}
          name="teacherId"
          rules={[
            requiredFieldRule(t("addAssignmentForm.validation.teacherRequired")),
          ]}
        >
          <Select
            showSearch
            allowClear
            loading={isLoadingTeachers}
            disabled={isTeachersError || isSaving}
            notFoundContent={t("addAssignmentForm.noTeachers")}
            placeholder={t("addAssignmentForm.selectTeacherPlaceholder")}
            options={teachers.map((teacher) => ({
              label: teacher.profile.fullName || teacher.username,
              value: teacher.id,
            }))}
            filterOption={(input, option) => {
              const teacher = teachers.find(
                (candidate) => candidate.id === Number(option?.value)
              );
              if (!teacher) return false;

              const searchText = normalizeSearchText(
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
              );

              return searchText.includes(normalizeSearchText(input.trim()));
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
            onChange={onTeacherChange}
            size="large"
            variant="outlined"
            className="w-full [&_.ant-select-selector]:!h-auto [&_.ant-select-selector]:!min-h-16 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-background-paper [&_.ant-select-selector]:!px-3 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!w-full [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!py-1"
          />
        </AdminFormField>
      </AdminFormSection>

      <AdminFormSection
        title={t("addAssignmentForm.subjectSection")}
        description={t("addAssignmentForm.subjectDescription")}
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-3 rounded-xl border border-other-outlined-border bg-background-paper p-3 sm:flex-row sm:items-center sm:justify-between">
            <Input.Search
              aria-label={t("addAssignmentForm.searchSubjectPlaceholder")}
              allowClear
              disabled={isSaving}
              placeholder={t("addAssignmentForm.searchSubjectPlaceholder")}
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              size="large"
              className="min-w-0 sm:max-w-md"
            />
            <span className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-custom-background-primary-background px-3 text-sm font-medium text-primary-main sm:self-auto">
              <span>{t("addAssignmentForm.selectedSubjects")}</span>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-background-paper px-1.5 text-xs font-semibold text-primary-main">
                {subjectIds.length}
              </span>
            </span>
          </div>

          <FormField
            noStyle
            shouldUpdate={(previous, current) =>
              previous.subjectIds !== current.subjectIds
            }
          >
            {() => {
              const subjectErrors = form.getFieldError("subjectIds");

              return (
                <AdminFormField
                  label={t("addAssignmentForm.subjectName")}
                  required
                  help={subjectErrors[0]}
                  validateStatus={subjectErrors.length ? "error" : undefined}
                  extra={
                    !teacherId
                      ? t("addAssignmentForm.selectTeacherFirst")
                      : undefined
                  }
                  className="bg-transparent !p-0"
                >
                  <div className="overflow-hidden rounded-xl border border-other-outlined-border bg-background-paper">
                    <AssignmentSubjectTable
                      subjects={subjects}
                      selectedSubjectIds={subjectIds}
                      isTeacherSelected={!!teacherId}
                      isLoading={isLoadingSubjects}
                      isSaving={isSaving}
                      allVisibleSelected={allVisibleSelected}
                      someVisibleSelected={someVisibleSelected}
                      onToggleVisibleSubjects={onToggleVisibleSubjects}
                      onToggleSubject={onToggleSubject}
                    />
                  </div>
                </AdminFormField>
              );
            }}
          </FormField>
          <FormField
            name="subjectIds"
            hidden
            getValueProps={(value?: number[]) => ({
              value: value?.length ? "selected" : "",
            })}
            rules={[
              translatedValidationRule(AssignmentValidate.getSubjectIdsError, t),
            ]}
          >
            <Input type="hidden" />
          </FormField>
        </div>
      </AdminFormSection>
    </div>
  );
}
