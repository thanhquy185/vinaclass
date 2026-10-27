import { useTranslation } from "react-i18next";
import {
  useCourseGroupDetail,
  useCourseGroupStudents,
} from "@/features/classrooms/hooks/useCourseGroupQueries";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";
import { usePermissionNavigation } from "@/features/authorization/hooks/usePermissionNavigation";
import {
  getLegacyFunctionActions,
  type LegacyFunctionAction,
} from "@/features/authorization/utils/legacyActions";

const PAGE_NAME = "hoc_phan";

export function useCourseGroupRosterData(groupId?: string) {
  const parsedGroupId = Number(groupId);
  const isValidGroupId = Number.isInteger(parsedGroupId) && parsedGroupId > 0;
  const { t } = useTranslation("common");
  const { user, role } = useAuthStore();
  const {
    courseGroup,
    isLoading: isLoadingGroup,
    isFetching: isFetchingGroup,
    isError: isGroupError,
    refetch: refetchGroup,
  } = useCourseGroupDetail(isValidGroupId ? parsedGroupId : 0);
  const roleKind = getAuthenticatedRoleKind(user, role);
  const permissionNavigation = usePermissionNavigation();
  const roleActions = getLegacyFunctionActions(
    role?.roleDetails ?? [],
    PAGE_NAME
  );
  const hasAction = (legacyAction: LegacyFunctionAction, actionCode: string) =>
    permissionNavigation.isEnabled
      ? permissionNavigation.hasFunctionAction(PAGE_NAME, actionCode)
      : roleActions.includes(legacyAction);
  const isAdmin = roleKind === "ADMIN" || roleKind === "CUSTOM";
  const isTeacherOwner =
    roleKind === "TEACHER" &&
    courseGroup?.teacherId !== null &&
    courseGroup?.teacherId === user?.id;
  const canView =
    isValidGroupId && (isAdmin || isTeacherOwner) && hasAction("view", "VIEW");
  const canManageRoster =
    (isAdmin || isTeacherOwner) && hasAction("update", "UPDATE");
  const {
    students,
    message,
    success,
    isLoading: isLoadingStudents,
    isFetching: isFetchingStudents,
    isError: isStudentsError,
    refetch: refetchStudents,
  } = useCourseGroupStudents(isValidGroupId ? parsedGroupId : 0, canView);

  const isPermissionLoading =
    permissionNavigation.isEnabled && permissionNavigation.isLoading;
  const isLoading =
    isLoadingGroup || isPermissionLoading || (canView && isLoadingStudents);
  const isError =
    isGroupError ||
    (permissionNavigation.isEnabled && permissionNavigation.isError) ||
    (canView && (isStudentsError || !success));
  const isFetching =
    isFetchingGroup ||
    (permissionNavigation.isEnabled && permissionNavigation.isFetching) ||
    (canView && isFetchingStudents);
  const classTitle = courseGroup?.groupName ?? t("courseGroupStudent.title");
  const subjectName =
    courseGroup?.subject?.subjectName ??
    courseGroup?.subject?.subjectCode ??
    t("courseGroupStudent.subjectUnavailable");

  const retryLoading = async () => {
    const retries: Promise<unknown>[] = [refetchGroup()];
    if (canView) retries.push(refetchStudents());
    if (permissionNavigation.isEnabled && permissionNavigation.isError) {
      retries.push(permissionNavigation.refetch());
    }
    await Promise.all(retries);
  };

  return {
    parsedGroupId,
    isValidGroupId,
    courseGroup,
    students,
    message,
    canView,
    canManageRoster,
    isLoading,
    isError,
    isFetching,
    classTitle,
    subjectName,
    retryLoading,
  };
}
