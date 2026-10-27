import { Form } from "antd";
import type { FormInstance } from "antd";
import type { Exam, Subject } from "@/shared/types";
import type {
  TestFieldRuleFactory,
  TestFormValues,
} from "@/features/assessments/types/testForm";
import { TestCourseGroupAssignmentFields } from "@/features/assessments/components/TestCourseGroupAssignmentFields";
import { TestDetailsFields } from "@/features/assessments/components/TestDetailsFields";

type TestFormFieldsProps = {
  form: FormInstance<TestFormValues>;
  testData?: Partial<Exam> | null;
  availableSubjects: Subject[];
  groupOptions: Array<{ label: string; value: number }>;
  isLoadingCourseGroups: boolean;
  isCourseGroupsError: boolean;
  refetchCourseGroups: () => Promise<unknown>;
  isViewMode: boolean;
  isEditMode: boolean;
  isLoadingSubjectOptions: boolean;
  isPermissionNavigationEnabled: boolean;
  canAssignCourseGroups: boolean;
  validateTestField: TestFieldRuleFactory;
  onValuesChange: (
    changedValues: Record<string, unknown>,
    values: Record<string, unknown>,
  ) => void;
};

export default function TestFormFields({
  form,
  testData,
  availableSubjects,
  groupOptions,
  isLoadingCourseGroups,
  isCourseGroupsError,
  refetchCourseGroups,
  isViewMode,
  isEditMode,
  isLoadingSubjectOptions,
  isPermissionNavigationEnabled,
  canAssignCourseGroups,
  validateTestField,
  onValuesChange,
}: TestFormFieldsProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={onValuesChange}
      className="flex flex-col gap-4"
    >
      <TestDetailsFields
        isViewMode={isViewMode}
        validateTestField={validateTestField}
        data={testData}
      />
      <TestCourseGroupAssignmentFields
        availableSubjects={availableSubjects}
        groupOptions={groupOptions}
        selectedSubjectId={testData?.subject?.id ?? testData?.subjectId}
        isLoadingCourseGroups={isLoadingCourseGroups}
        isCourseGroupsError={isCourseGroupsError}
        refetchCourseGroups={refetchCourseGroups}
        isViewMode={isViewMode}
        isEditMode={isEditMode}
        isLoadingSubjectOptions={isLoadingSubjectOptions}
        isPermissionNavigationEnabled={isPermissionNavigationEnabled}
        canAssignCourseGroups={canAssignCourseGroups}
        validateTestField={validateTestField}
        data={testData}
      />
    </Form>
  );
}
