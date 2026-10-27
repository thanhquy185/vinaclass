import type { RoleDetailItem } from "@/shared/types";

export type LegacyFunctionAction = "view" | "create" | "update" | "delete";

const LEGACY_ACTION_FIELDS = [
  ["canView", "view"],
  ["canCreate", "create"],
  ["canUpdate", "update"],
  ["canDelete", "delete"],
] as const satisfies readonly (readonly [
  keyof RoleDetailItem,
  LegacyFunctionAction,
])[];

const ACTION_PERMISSION_FIELDS: Record<
  LegacyFunctionAction | "publish" | "lock" | "assign",
  keyof RoleDetailItem | null
> = {
  view: "canView",
  create: "canCreate",
  update: "canUpdate",
  delete: "canDelete",
  publish: "canUpdate",
  lock: "canUpdate",
  assign: null,
};

export function getLegacyFunctionActions(
  roleDetails: RoleDetailItem[],
  functionCode: string
): LegacyFunctionAction[] {
  return roleDetails
    .filter((item) => item.functionName === functionCode)
    .flatMap((item) =>
      LEGACY_ACTION_FIELDS.filter(([field]) => item[field]).map(
        ([, action]) => action
      )
    );
}

export function hasLegacyFunctionAction(
  roleDetails: RoleDetailItem[],
  functionCode: string,
  action: keyof typeof ACTION_PERMISSION_FIELDS
): boolean {
  const permission = roleDetails.find(
    (item) => item.functionName === functionCode
  );
  const permissionField = ACTION_PERMISSION_FIELDS[action];

  return permissionField !== null && permission?.[permissionField] === true;
}
