import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useExamDetail } from "@/features/assessments/hooks/useExamQueries";
import { useTestFormController } from "@/features/assessments/hooks/useTestFormController";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useRoleScopedSubjectQueries } from "@/features/catalogs/hooks/useRoleScopedSubjectQueries";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { CourseGroup, CourseGroupDetailStudent } from "@/shared/types";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";

interface TestFormRouteState {
  fromQuestions?: boolean;
  courseGroup?: CourseGroupDetailStudent;
}

export function useTestFormPageController() {
  const { pathname, state } = useLocation();
  const routeState = state as TestFormRouteState | null;
  const sourceCourseGroup = routeState?.courseGroup;
  const contextualCourseGroup = useMemo<CourseGroup | undefined>(
    () =>
      sourceCourseGroup
        ? {
            ...sourceCourseGroup,
            joinCode: sourceCourseGroup.joinCode ?? "",
          }
        : undefined,
    [sourceCourseGroup]
  );
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = pathname.includes("/edit");
  const isViewMode = pathname.includes("/view");
  const isAddMode = pathname.includes("/add");
  const urlId = id ? Number(id) : null;
  const isPersistedExamMode = isEditMode || isViewMode;
  const isValidExamId = urlId !== null && Number.isInteger(urlId) && urlId > 0;

  const { user, role } = useAuthStore();
  const roleKind = getAuthenticatedRoleKind(user, role);
  const permission = useFunctionActions("de_thi");
  const subjects = useRoleScopedSubjectQueries();
  const examQuery = useExamDetail(urlId, {
    enabled: isValidExamId && isPersistedExamMode,
  });
  const form = useTestFormController({
    isAddMode,
    isEditMode,
    isViewMode,
    fromQuestions: routeState?.fromQuestions ?? false,
    urlId,
    exam: examQuery.exam,
    contextualCourseGroup,
    allSubjects: subjects.allSubjects,
    isLoadingSubjects: subjects.isLoadingAllSubjects,
    teacherSubjects: subjects.teacherSubjects,
    isLoadingTeacherSubjects: subjects.isLoadingTeacherSubjects,
    user,
    role,
    isPermissionNavigationEnabled: permission.isPermissionNavigationEnabled,
    isPermissionLoading: permission.isLoading,
    hasExamAction: permission.hasAction,
    navigate,
  });

  return {
    navigate,
    roleKind,
    isEditMode,
    isViewMode,
    isAddMode,
    isPersistedExamMode,
    isValidExamId,
    permission,
    subjects,
    examQuery,
    form,
  };
}
