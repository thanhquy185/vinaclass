import type { NavigateFunction } from "react-router-dom";
import type {
  CourseGroup,
  Exam,
  RoleResponse,
  Subject,
  User,
} from "@/shared/types";
import type { FunctionAction } from "@/features/authorization/hooks/useFunctionActions";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useTestFormActions } from "@/features/assessments/hooks/useTestFormActions";
import { useTestFormCourseGroups } from "@/features/assessments/hooks/useTestFormCourseGroups";
import { useTestFormDraft } from "@/features/assessments/hooks/useTestFormDraft";
import { useTestFormSubjectOptions } from "@/features/assessments/hooks/useTestFormSubjectOptions";
import { useTestFormValidation } from "@/features/assessments/hooks/useTestFormValidation";

interface UseTestFormControllerOptions {
  isAddMode: boolean;
  isEditMode: boolean;
  isViewMode: boolean;
  fromQuestions: boolean;
  urlId: number | null;
  exam?: Exam;
  contextualCourseGroup?: CourseGroup;
  allSubjects: Subject[];
  isLoadingSubjects: boolean;
  teacherSubjects: Subject[];
  isLoadingTeacherSubjects: boolean;
  user: User | null;
  role: RoleResponse | null;
  isPermissionNavigationEnabled: boolean;
  isPermissionLoading: boolean;
  hasExamAction: (action: FunctionAction) => boolean;
  navigate: NavigateFunction;
}

export function useTestFormController({
  isAddMode,
  isEditMode,
  isViewMode,
  fromQuestions,
  urlId,
  exam,
  contextualCourseGroup,
  allSubjects,
  isLoadingSubjects,
  teacherSubjects,
  isLoadingTeacherSubjects,
  user,
  role,
  isPermissionNavigationEnabled,
  isPermissionLoading,
  hasExamAction,
  navigate,
}: UseTestFormControllerOptions) {
  const canAssignCourseGroups =
    !isPermissionNavigationEnabled ||
    (!isPermissionLoading && hasExamAction("assign"));

  const testData = useExamDraftStore((store) => store.testData);
  const { availableSubjects, isLoadingSubjectOptions } =
    useTestFormSubjectOptions({
      role,
      allSubjects,
      teacherSubjects,
      isLoadingSubjects,
      isLoadingTeacherSubjects,
      contextualCourseGroup,
    });
  const selectedSubjectId = testData?.subject?.id ?? testData?.subjectId;
  const {
    courseGroups,
    groupOptions,
    isLoadingCourseGroups,
    isCourseGroupsError,
    refetchCourseGroups,
  } = useTestFormCourseGroups({
    subjectId: selectedSubjectId,
    enabled: !isViewMode && canAssignCourseGroups,
  });

  const draft = useTestFormDraft({
    isAddMode,
    isEditMode,
    isViewMode,
    fromQuestions,
    urlId,
    exam,
    testData,
    contextualCourseGroup,
    availableSubjects,
    availableCourseGroups: courseGroups,
    isLoadingSubjectOptions,
  });
  const validateTestField = useTestFormValidation({
    form: draft.form,
    userId: user?.id,
  });
  const { creatorError, handleContinue } = useTestFormActions({
    form: draft.form,
    isViewMode,
    userId: user?.id,
    updateTestData: draft.updateTestData,
    navigate,
  });

  return {
    testData: draft.testData,
    updateConfiguration: draft.updateConfiguration,
    form: draft.form,
    creatorError,
    availableSubjects,
    groupOptions,
    isLoadingCourseGroups,
    isCourseGroupsError,
    refetchCourseGroups,
    isLoadingSubjectOptions,
    canAssignCourseGroups,
    validateTestField,
    handleFormValuesChange: draft.handleFormValuesChange,
    handleContinue,
  };
}
