import type { Role, User } from "@/shared/types";

export type SystemRoleCode = "ADMIN" | "TEACHER" | "STUDENT";
export type AuthenticatedRoleKind = SystemRoleCode | "CUSTOM" | null;

const normalizeRoleName = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeSystemRoleCode = (
  value?: string | null
): SystemRoleCode | null => {
  const code = value?.trim().toUpperCase();
  return code === "ADMIN" || code === "TEACHER" || code === "STUDENT"
    ? code
    : null;
};

export const getDeclaredSystemRoleCode = (
  code?: string | null
): SystemRoleCode | null => normalizeSystemRoleCode(code);

export const getSystemRoleCode = (
  role?: Pick<Role, "code" | "roleName"> | null
): SystemRoleCode | null => {
  if (!role) return null;

  const code = normalizeSystemRoleCode(role.code);
  if (code) return code;

  const normalizedName = normalizeRoleName(role.roleName);
  if (
    ["admin", "administrator", "quan_tri_vien", "quan_tri"].includes(
      normalizedName
    )
  ) {
    return "ADMIN";
  }
  if (["teacher", "giang_vien", "giao_vien"].includes(normalizedName)) {
    return "TEACHER";
  }
  if (["student", "sinh_vien", "hoc_sinh"].includes(normalizedName)) {
    return "STUDENT";
  }

  return null;
};

export const getAuthenticatedUserRoleCode = (
  user:
    | (Pick<User, "roleId"> & Partial<Pick<User, "roleCode">>)
    | null
    | undefined,
  role?: Pick<Role, "code" | "roleName"> | null
): SystemRoleCode | null => {
  if (user && user.roleCode !== undefined) {
    return normalizeSystemRoleCode(user.roleCode);
  }

  return getSystemRoleCode(role);
};

/**
 * Distinguishes the three dedicated workspaces from user-defined roles.
 * Custom roles use the ADMIN application shell, with their menu and routes
 * limited by the effective function permissions returned by the API.
 */
export const getAuthenticatedRoleKind = (
  user:
    | (Pick<User, "roleId"> & Partial<Pick<User, "roleCode">>)
    | null
    | undefined,
  role?: Pick<Role, "code" | "roleName"> | null
): AuthenticatedRoleKind => {
  const userRoleCode = user?.roleCode?.trim();
  if (userRoleCode) {
    const systemRoleCode = normalizeSystemRoleCode(userRoleCode);
    return systemRoleCode ?? "CUSTOM";
  }

  const roleSystemCode = getSystemRoleCode(role);
  if (roleSystemCode) return roleSystemCode;

  if (user?.roleId != null || role) return "CUSTOM";
  return null;
};

export const getUserSystemRoleCode = (
  user: Pick<User, "roleId"> & Partial<Pick<User, "roleCode">>,
  roles: Role[]
): SystemRoleCode | null => {
  if (user.roleCode !== undefined) {
    return normalizeSystemRoleCode(user.roleCode);
  }

  return getSystemRoleCode(roles.find((role) => role.id === user.roleId));
};
