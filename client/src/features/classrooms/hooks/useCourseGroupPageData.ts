import { useMemo } from "react";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";
import { usePermissionNavigation } from "@/features/authorization/hooks/usePermissionNavigation";
import {
  getLegacyFunctionActions,
  type LegacyFunctionAction,
} from "@/features/authorization/utils/legacyActions";
import {
  useCourseGroups,
  useCourseGroupsByTeacher,
} from "@/features/classrooms/hooks/useCourseGroupQueries";

const PAGE_NAME = "hoc_phan";

export function useCourseGroupPageData() {
  const { user, role } = useAuthStore();
  const roleKind = getAuthenticatedRoleKind(user, role);
  const isAdmin = roleKind === "ADMIN";
  const isTeacher = roleKind === "TEACHER";
  const isCustomRole = roleKind === "CUSTOM";
  const isAdminWorkspace = isAdmin || isCustomRole;
  const isAccessDenied = roleKind === "STUDENT" || roleKind === null;
  const legacyActions = getLegacyFunctionActions(
    role?.roleDetails ?? [],
    PAGE_NAME
  );
  const permissionNavigation = usePermissionNavigation();
  const hasAction = (legacyAction: LegacyFunctionAction, actionCode: string) =>
    permissionNavigation.isEnabled
      ? permissionNavigation.hasFunctionAction(PAGE_NAME, actionCode)
      : legacyActions.includes(legacyAction);
  const canView = !isAccessDenied && hasAction("view", "VIEW");
  const canViewStudentList = hasAction("view", "VIEW");
  const canCreateGroup = hasAction("create", "CREATE");
  const canUpdateGroup = hasAction("update", "UPDATE");
  const canDeleteGroup = hasAction("delete", "DELETE");

  const {
    courseGroups,
    isLoading,
    isFetching,
    isError,
    refetch: refetchCourseGroups,
  } = useCourseGroups(isAdminWorkspace && canView, user?.id);
  const {
    courseGroups: teacherCourseGroups,
    isLoading: isLoadingTeacherGroups,
    isFetching: isFetchingTeacherGroups,
    isError: isTeacherGroupsError,
    refetch: refetchTeacherGroups,
  } = useCourseGroupsByTeacher(user?.id, isTeacher && canView);

  const courseGroupDisplay = useMemo(() => {
    if (isAdminWorkspace) return courseGroups;
    if (isTeacher) return teacherCourseGroups;
    return [];
  }, [isAdminWorkspace, isTeacher, courseGroups, teacherCourseGroups]);

  const isPageLoading =
    (permissionNavigation.isEnabled && permissionNavigation.isLoading) ||
    (isTeacher ? isLoadingTeacherGroups : isAdminWorkspace && isLoading);
  const isPageError =
    (permissionNavigation.isEnabled && permissionNavigation.isError) ||
    (isTeacher ? isTeacherGroupsError : isAdminWorkspace && isError);
  const isPageFetching =
    (permissionNavigation.isEnabled && permissionNavigation.isFetching) ||
    (isTeacher ? isFetchingTeacherGroups : isAdminWorkspace && isFetching);

  const retryLoading = () => {
    const retries: Promise<unknown>[] = [];
    if (permissionNavigation.isEnabled && permissionNavigation.isError) {
      retries.push(permissionNavigation.refetch());
    }
    if (isTeacher && isTeacherGroupsError) {
      retries.push(refetchTeacherGroups());
    }
    if (isAdminWorkspace && isError) retries.push(refetchCourseGroups());
    return Promise.all(retries);
  };

  return {
    courseGroupDisplay,
    isTeacher,
    isAccessDenied,
    canView,
    canCreateGroup,
    canViewStudentList,
    canUpdateGroup,
    canDeleteGroup,
    isPageLoading,
    isPageError,
    isPageFetching,
    retryLoading,
  };
}
