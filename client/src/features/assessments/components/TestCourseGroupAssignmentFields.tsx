import { useTranslation } from "react-i18next";
import { Button, Checkbox, Spin } from "antd";
import type { Exam, Subject } from "@/shared/types";
import type { TestFieldRuleFactory } from "@/features/assessments/types/testForm";
import { FormField } from "@/shared/components/ui";
import {
  AdminFormField,
  AdminFormSection,
  AdminPanel,
  AdminReadOnlyField,
  AdminSelectField,
} from "@/shared/components/admin";

interface TestCourseGroupAssignmentFieldsProps {
  availableSubjects: Subject[];
  groupOptions: Array<{ label: string; value: number }>;
  selectedSubjectId?: number;
  isLoadingCourseGroups: boolean;
  isCourseGroupsError: boolean;
  refetchCourseGroups: () => Promise<unknown>;
  isViewMode: boolean;
  isEditMode: boolean;
  isLoadingSubjectOptions: boolean;
  isPermissionNavigationEnabled: boolean;
  canAssignCourseGroups: boolean;
  validateTestField: TestFieldRuleFactory;
  data?: Partial<Exam> | null;
}

export function TestCourseGroupAssignmentFields({
  availableSubjects,
  groupOptions,
  selectedSubjectId,
  isLoadingCourseGroups,
  isCourseGroupsError,
  refetchCourseGroups,
  isViewMode,
  isEditMode,
  isLoadingSubjectOptions,
  isPermissionNavigationEnabled,
  canAssignCourseGroups,
  validateTestField,
  data,
}: TestCourseGroupAssignmentFieldsProps) {
  const { t } = useTranslation();

  return (
    <AdminPanel className="p-4 sm:p-5">
      <AdminFormSection
        title={t("testFormPage.sections.assignment")}
        description={t("testFormPage.sections.assignmentDescription")}
      >
        {isViewMode ? (
          <dl className="mt-4 grid grid-cols-1 gap-3">
            <AdminReadOnlyField
              label={t("testFormPage.fields.subject.label")}
              value={data?.subject?.subjectName}
            />
            <AdminReadOnlyField
              label={t("testFormPage.fields.courseGroups.label")}
              value={
                data?.courseGroups?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {data.courseGroups.map((group) => (
                      <span
                        key={group.id}
                        className="rounded-full bg-action-hover px-3 py-1 text-xs font-medium text-text-secondary"
                      >
                        {group.groupName}
                      </span>
                    ))}
                  </div>
                ) : (
                  t("testItem.noClasses")
                )
              }
            />
          </dl>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <AdminSelectField
              name="subjectId"
              label={t("testFormPage.fields.subject.label")}
              required
              rules={[validateTestField("subjectId")]}
              showSearch
              optionFilterProp="label"
              placeholder={t("testFormPage.assignTo.placeholder")}
              options={availableSubjects.map((subject) => ({
                label: `${subject.subjectCode} · ${subject.subjectName}`,
                value: subject.id,
              }))}
              loading={isLoadingSubjectOptions}
              disabled={isViewMode || (isEditMode && !canAssignCourseGroups)}
            />

            <AdminFormField
              label={t("testFormPage.fields.courseGroups.label")}
              required
              className="mb-0"
            >
              {isPermissionNavigationEnabled &&
                !canAssignCourseGroups &&
                !isViewMode && (
                  <p className="mb-3 text-sm font-normal text-text-secondary">
                    {t("testFormPage.assignmentPermissionRequired")}
                  </p>
                )}
              {canAssignCourseGroups && !isViewMode && !selectedSubjectId && (
                <p className="mb-3 text-sm font-normal text-text-secondary">
                  {t("testFormPage.selectSubjectForGroups")}
                </p>
              )}
              {canAssignCourseGroups &&
                !isViewMode &&
                selectedSubjectId &&
                isLoadingCourseGroups && (
                  <div
                    className="mb-3 flex items-center gap-2 text-sm font-normal text-text-secondary"
                    role="status"
                  >
                    <Spin size="small" />
                    <span>{t("testFormPage.loadingCourseGroups")}</span>
                  </div>
                )}
              {canAssignCourseGroups &&
                !isViewMode &&
                selectedSubjectId &&
                isCourseGroupsError && (
                  <div
                    className="mb-3 flex flex-wrap items-center gap-1 text-sm font-normal text-error-main"
                    role="status"
                  >
                    <span>{t("testFormPage.courseGroupsLoadError")}</span>
                    <Button
                      type="link"
                      size="small"
                      className="!h-auto !px-1 !py-0"
                      onClick={() => void refetchCourseGroups()}
                    >
                      {t("testFormPage.actions.retry")}
                    </Button>
                  </div>
                )}
              {canAssignCourseGroups &&
                !isViewMode &&
                selectedSubjectId &&
                !isLoadingCourseGroups &&
                !isCourseGroupsError &&
                groupOptions.length === 0 && (
                  <p className="mb-3 text-sm font-normal text-text-secondary">
                    {t("testFormPage.noCourseGroups")}
                  </p>
                )}
              {!canAssignCourseGroups &&
              isEditMode &&
              data?.courseGroups?.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {data.courseGroups.map((group) => (
                    <span
                      key={group.id}
                      className="rounded-full bg-action-hover px-3 py-1 text-xs font-medium text-text-secondary"
                    >
                      {group.groupName}
                    </span>
                  ))}
                </div>
              ) : null}
              <FormField
                name="courseGroupIds"
                noStyle
                rules={[validateTestField("courseGroupIds")]}
              >
                <Checkbox.Group
                  className={groupOptions.length > 0 ? "w-full" : "hidden"}
                  disabled={!canAssignCourseGroups}
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {groupOptions.map((group) => (
                      <div
                        key={group.value}
                        className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-other-outlined-border bg-background-paper px-3 py-2.5 transition-colors hover:border-primary-main/50 hover:bg-custom-background-primary-background has-[:checked]:border-primary-main has-[:checked]:bg-custom-background-primary-background"
                      >
                        <Checkbox value={group.value} className="w-full">
                          <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                            {group.label}
                          </span>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </Checkbox.Group>
              </FormField>
            </AdminFormField>
          </div>
        )}
      </AdminFormSection>
    </AdminPanel>
  );
}
