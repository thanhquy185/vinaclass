import type { Role } from "@/shared/types";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";
import { getDeclaredSystemRoleCode } from "@/shared/utils/role";

export type PermissionGroupKind = "all" | "system" | "custom";
export type PermissionGroupSearchCriterion = "name" | "code";

interface FilterPermissionGroupsOptions {
  roles: Role[];
  searchTerm: string;
  searchBy: PermissionGroupSearchCriterion;
  kind: PermissionGroupKind;
}

export function filterPermissionGroups({
  roles,
  searchTerm,
  searchBy,
  kind,
}: FilterPermissionGroupsOptions): Role[] {
  const normalizedTerm = normalizeSearchText(searchTerm.trim());

  return roles.filter((role) => {
    const isSystemRole = getDeclaredSystemRoleCode(role.code) !== null;
    if (kind === "system" && !isSystemRole) return false;
    if (kind === "custom" && isSystemRole) return false;
    if (!normalizedTerm) return true;

    const searchValue =
      searchBy === "name" ? role.roleName : formatPermissionGroupCode(role);
    return normalizeSearchText(searchValue).includes(normalizedTerm);
  });
}

export function formatPermissionGroupCode(role: Role): string {
  const code = role.code?.trim();
  return code || `NQ-${String(role.id).padStart(3, "0")}`;
}

export function isSystemPermissionGroup(role: Role): boolean {
  return getDeclaredSystemRoleCode(role.code) !== null;
}
