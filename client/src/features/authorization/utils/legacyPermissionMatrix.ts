import type {
  FunctionCatalogItem,
  PermissionAction,
  PermissionItem,
  RoleDetailItem,
} from "@/shared/types";

const CRUD_ACTION_MAP: Record<string, PermissionAction> = {
  VIEW: "read",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

const fallbackAvailableActions: Record<string, PermissionAction[]> = {
  nguoi_dung: ["read", "create", "update", "delete"],
  do_kho: ["read", "create", "update", "delete"],
  hoc_phan: ["read", "create", "update", "delete"],
  cau_hoi: ["read", "create", "update", "delete"],
  mon_hoc: ["read", "create", "update", "delete"],
  chuong: ["read", "create", "update", "delete"],
  phan_cong: ["read", "create", "update", "delete"],
  de_thi: ["read", "create", "update", "delete"],
  nhom_quyen: ["read", "create", "update", "delete"],
  ma_tran_quyen: ["read"],
  thong_bao: ["read", "create", "update", "delete"],
  tai_lieu: ["read", "create", "update", "delete"],
  thong_ke_ket_qua: ["read"],
  thong_ke_de_thi: ["read"],
  thong_ke_lop_hoc: ["read"],
  thong_ke_cau_hoi: ["read"],
};

export const permissionSupportsAction = (
  permission: PermissionItem,
  action: PermissionAction,
) => permission.availableActions?.includes(action) ?? true;

const permissionKeys = [
  "nguoi_dung",
  "do_kho",
  "hoc_phan",
  "cau_hoi",
  "mon_hoc",
  "phan_cong",
  "de_thi",
  "nhom_quyen",
  "ma_tran_quyen",
  "thong_bao",
  "chuong",
  "tai_lieu",
  "thong_ke_ket_qua",
  "thong_ke_de_thi",
  "thong_ke_lop_hoc",
  "thong_ke_cau_hoi",
];

export const defaultLegacyPermissions: PermissionItem[] = permissionKeys.map(
  (key) => ({
    key,
    name: key,
    availableActions: fallbackAvailableActions[key] ?? [],
    actions: { read: false, create: false, update: false, delete: false },
  })
);

export const mapFunctionCatalogToPermissions = (
  functions: FunctionCatalogItem[],
  isEnglish: boolean
): PermissionItem[] =>
  functions
    .filter((feature) => feature.status !== false)
    .map((feature) => ({
      key: feature.functionName,
      name:
        (isEnglish ? feature.nameEn : feature.nameVi) ??
        (isEnglish ? feature.nameVi : feature.nameEn) ??
        feature.functionName,
      availableActions:
        feature.actionCodes?.map((actionCode) => CRUD_ACTION_MAP[actionCode])
          .filter((action): action is PermissionAction => action !== undefined) ??
        fallbackAvailableActions[feature.functionName] ??
        [],
      actions: { read: false, create: false, update: false, delete: false },
    }));

export const convertRoleDetailsToPermissions = (
  details: RoleDetailItem[],
  catalog: PermissionItem[] = defaultLegacyPermissions
): PermissionItem[] =>
  catalog.map((permission) => {
    const roleDetail = details.find(
      (item) => item.functionName === permission.key
    );

    return {
      ...permission,
      actions: {
        read: Boolean(roleDetail?.canView) && permissionSupportsAction(permission, "read"),
        create: Boolean(roleDetail?.canCreate) && permissionSupportsAction(permission, "create"),
        update: Boolean(roleDetail?.canUpdate) && permissionSupportsAction(permission, "update"),
        delete: Boolean(roleDetail?.canDelete) && permissionSupportsAction(permission, "delete"),
      },
    };
  });

export const convertPermissionsToRoleDetails = (
  permissions: PermissionItem[]
): RoleDetailItem[] =>
  permissions
    .map((permission) => ({
      functionName: permission.key,
      canView: permission.actions.read && permissionSupportsAction(permission, "read"),
      canCreate: permission.actions.create && permissionSupportsAction(permission, "create"),
      canUpdate: permission.actions.update && permissionSupportsAction(permission, "update"),
      canDelete: permission.actions.delete && permissionSupportsAction(permission, "delete"),
    }))
    .filter(
      (permission) =>
        permission.canView ||
        permission.canCreate ||
        permission.canUpdate ||
        permission.canDelete
    );
