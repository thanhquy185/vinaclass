import type {
  PermissionMatrixFunction,
  RolePermissionMatrix,
  UserPermissionOverrideMatrix,
} from "@/shared/types";

export type PermissionEffect = "GRANT" | "DENY";

export interface PermissionOverride {
  permissionId: number;
  effect: PermissionEffect;
}

const ACTION_ORDER: Record<string, number> = {
  VIEW: 10,
  CREATE: 20,
  UPDATE: 30,
  DELETE: 40,
  LOCK: 50,
  PUBLISH: 60,
  ASSIGN: 70,
  GRADE: 80,
};

export const sortPermissionActionCodes = (
  functions: PermissionMatrixFunction[] = []
): string[] =>
  [
    ...new Set(
      functions.flatMap((feature) =>
        feature.permissions.map((permission) => permission.actionCode)
      )
    ),
  ].sort(
    (first, second) =>
      (ACTION_ORDER[first] ?? 999) - (ACTION_ORDER[second] ?? 999) ||
      first.localeCompare(second)
  );

export const getRolePermissionIds = (matrix?: RolePermissionMatrix): number[] =>
  matrix?.functions
    .flatMap((feature) => feature.permissions)
    .filter((permission) => permission.allowed)
    .map((permission) => permission.id)
    .sort((first, second) => first - second) ?? [];

export const arePermissionIdsEqual = (
  savedIds: number[],
  selectedIds: number[]
): boolean => {
  if (savedIds.length !== selectedIds.length) return false;

  const sortedSelectedIds = [...selectedIds].sort(
    (first, second) => first - second
  );

  return savedIds.every(
    (permissionId, index) => permissionId === sortedSelectedIds[index]
  );
};

export const getUserPermissionOverrides = (
  matrix?: UserPermissionOverrideMatrix
): PermissionOverride[] =>
  matrix?.functions
    .flatMap((feature) => feature.permissions)
    .filter((permission) => permission.override !== null)
    .map((permission) => ({
      permissionId: permission.id,
      effect: permission.override as PermissionEffect,
    }))
    .sort((first, second) => first.permissionId - second.permissionId) ?? [];

export const toPermissionOverrideValues = (
  overrides: PermissionOverride[]
): Record<number, PermissionEffect> =>
  Object.fromEntries(
    overrides.map(({ permissionId, effect }) => [permissionId, effect])
  ) as Record<number, PermissionEffect>;

export const getSortedPermissionOverrides = (
  values: Record<number, PermissionEffect>
): PermissionOverride[] =>
  Object.entries(values)
    .map(([permissionId, effect]) => ({
      permissionId: Number(permissionId),
      effect,
    }))
    .sort((first, second) => first.permissionId - second.permissionId);

export const arePermissionOverridesEqual = (
  savedOverrides: PermissionOverride[],
  selectedOverrides: PermissionOverride[]
): boolean => {
  if (savedOverrides.length !== selectedOverrides.length) return false;

  return savedOverrides.every(
    (override, index) =>
      override.permissionId === selectedOverrides[index]?.permissionId &&
      override.effect === selectedOverrides[index]?.effect
  );
};
