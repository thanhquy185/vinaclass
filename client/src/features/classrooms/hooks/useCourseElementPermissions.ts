import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { Notification } from "@/features/classrooms/types/classrooms";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";
import { usePermissionNavigation } from "@/features/authorization/hooks/usePermissionNavigation";
import { hasLegacyFunctionAction } from "@/features/authorization/utils/legacyActions";

export function useCourseElementPermissions() {
  const { user, role } = useAuthStore();
  const roleKind = getAuthenticatedRoleKind(user, role);
  const isAdmin = roleKind === "ADMIN";
  const isTeacher = roleKind === "TEACHER";
  const isStudent = roleKind === "STUDENT";
  const isCustomRole = roleKind === "CUSTOM";
  const { hasFunctionAction, isEnabled: isPermissionV2Enabled } =
    usePermissionNavigation();

  const hasAction = (
    functionName: string,
    actionCode: string,
    legacyAction:
      | "view"
      | "create"
      | "update"
      | "delete"
      | "publish"
      | "lock"
      | "assign"
  ) =>
    isPermissionV2Enabled
      ? hasFunctionAction(functionName, actionCode)
      : hasLegacyFunctionAction(
          role?.roleDetails ?? [],
          functionName,
          legacyAction
        );

  const canViewClass = isAdmin || hasAction("hoc_phan", "VIEW", "view");
  const canViewMaterials =
    isAdmin || (canViewClass && hasAction("tai_lieu", "VIEW", "view"));
  const canCreateMaterials =
    !isStudent && canViewClass && hasAction("tai_lieu", "CREATE", "create");
  const canUpdateMaterials =
    !isStudent && canViewClass && hasAction("tai_lieu", "UPDATE", "update");
  const canDeleteMaterials =
    !isStudent && canViewClass && hasAction("tai_lieu", "DELETE", "delete");
  const canDeleteAnnouncementAction = hasAction(
    "thong_bao",
    "DELETE",
    "delete"
  );
  const canCreateAnnouncement =
    !isStudent && (isAdmin || hasAction("thong_bao", "CREATE", "create"));
  const canCreateExam =
    !isStudent &&
    canViewClass &&
    (isAdmin || hasAction("de_thi", "CREATE", "create")) &&
    (isAdmin ||
      !isPermissionV2Enabled ||
      hasAction("de_thi", "ASSIGN", "assign"));
  const canViewGrades =
    isAdmin || (canViewClass && hasAction("de_thi", "VIEW", "view"));

  const canDeleteAnnouncement = (notification: Notification) =>
    isAdmin ||
    (canDeleteAnnouncementAction &&
      ((isTeacher && user?.id === notification.senderId) || isCustomRole));

  return {
    userId: user?.id,
    isStudent,
    isTeacher,
    canViewMaterials,
    canCreateMaterials,
    canUpdateMaterials,
    canDeleteMaterials,
    canCreateAnnouncement,
    canCreateExam,
    canViewGrades,
    canDeleteAnnouncement,
  };
}
