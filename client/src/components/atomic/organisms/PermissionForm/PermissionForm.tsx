import React, { useEffect, useState, type FC, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/components/atomic/atoms";
import { cn } from "@/utils/cn";
import type {
  PermissionFormData,
  PermissionItem,
  RoleCreate,
  RoleDetailItem,
  RoleUpdate,
} from "@/types";
import { TextField } from "../../molecules/TextField/TextField";
import { Overlay } from "../../molecules/Overlay/Overlay";
import { useRoleDetail } from "@/hooks/useRole";
import { RoleValidate, type RoleError } from "@/validate/role.validate";

const defaultPermissions: PermissionItem[] = [
  {
    key: "nguoi_dung",
    name: "Người dùng",
    actions: { read: false, create: false, update: false, delete: false },
  },
  {
    key: "do_kho",
    name: "Độ khó",
    actions: { read: false, create: false, update: false, delete: false },
  },
  {
    key: "hoc_phan",
    name: "Học phần",
    actions: { read: false, create: false, update: false, delete: false },
  },
  {
    key: "cau_hoi",
    name: "Câu hỏi",
    actions: { read: false, create: false, update: false, delete: false },
  },
  {
    key: "mon_hoc",
    name: "Môn học",
    actions: { read: false, create: false, update: false, delete: false },
  },
  // {
  //   key: "chuong",
  //   name: "Chương",
  //   actions: { read: false, create: false, update: false, delete: false },
  // },
  {
    key: "phan_cong",
    name: "Phân công",
    actions: { read: false, create: false, update: false, delete: false },
  },
  {
    key: "de_thi",
    name: "Đề thi",
    actions: { read: false, create: false, update: false, delete: false },
  },
  {
    key: "nhom_quyen",
    name: "Nhóm quyền",
    actions: { read: false, create: false, update: false, delete: false },
  },
  {
    key: "thong_bao",
    name: "Thông báo",
    actions: { read: false, create: false, update: false, delete: false },
  },
];

const defaultGroupPermission: PermissionFormData = {
  groupName: "",
  permissions: defaultPermissions,
};

interface PermissionFormProps {
  mode: "create" | "view" | "update" | "none";
  id: number | undefined;
  onSaveCreate: (data: RoleCreate) => void;
  onSaveUpdate: (id: number, data: RoleUpdate) => void;
  onCancel: () => void;
  className?: string;
  children?: React.ReactNode;
}

const ConvertRoleDetails = (data: RoleDetailItem[]): PermissionItem[] => {
  return defaultPermissions.map((perm) => {
    const found = data.find((item) => item.functionName === perm.key);

    return {
      key: perm.key,
      name: perm.name,
      actions: found
        ? {
            read: found.canView,
            create: found.canCreate,
            update: found.canUpdate,
            delete: found.canDelete,
          }
        : {
            read: false,
            create: false,
            update: false,
            delete: false,
          },
    };
  });
};

const ConvertToRoleRequest = (data: PermissionItem[]): RoleDetailItem[] => {
  return data
    .map((perm) => ({
      functionName: perm.key,
      canView: perm.actions.read,
      canCreate: perm.actions.create,
      canUpdate: perm.actions.update,
      canDelete: perm.actions.delete,
    }))
    .filter(
      (item) =>
        item.canView || item.canCreate || item.canUpdate || item.canDelete
    );
};

export const PermissionForm: FC<PermissionFormProps> = ({
  mode,
  id,
  onSaveCreate,
  onSaveUpdate,
  onCancel,
  className,
}) => {
  const { t } = useTranslation();
  const permissionCols = [
    { key: "read", title: t("permissionForm.view") },
    { key: "create", title: t("permissionForm.create") },
    { key: "update", title: t("permissionForm.update") },
    { key: "delete", title: t("permissionForm.delete") },
  ] as const;
  //submit
  const [groupName, setGroupName] = useState<string>(
    defaultGroupPermission.groupName
  );
  const [permissions, setPermissions] = useState<PermissionItem[]>(
    defaultGroupPermission.permissions || []
  );
  //load
  const { role, isLoading } = useRoleDetail(id);

  // load data lên form
  useEffect(() => {
    if (role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGroupName(role.roleName);
      setPermissions(ConvertRoleDetails(role.roleDetails));
    }
  }, [role]);

  // const isCreate = mode === "create";
  const isView = mode === "view";
  // const isEdit = mode === "update";
  // const shouldFetch = !isCreate && !!id;

  // Toggle single checkbox state
  const handleCheckboxChange = (
    rowKey: string,
    actionKey: keyof PermissionItem["actions"]
  ) => {
    setPermissions((prev) =>
      prev.map((row) =>
        row.key === rowKey
          ? {
              ...row,
              actions: { ...row.actions, [actionKey]: !row.actions[actionKey] },
            }
          : row
      )
    );
  };

  // Toggle all checkboxes in a specific column
  const handleColAllClick = (actionKey: keyof PermissionItem["actions"]) => {
    const isAllChecked = permissions.every((row) => row.actions[actionKey]);
    setPermissions((prev) =>
      prev.map((row) => ({
        ...row,
        actions: { ...row.actions, [actionKey]: !isAllChecked },
      }))
    );
  };

  const [errors, setErrors] = useState<RoleError>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      const validationErrors = RoleValidate.create({
        roleName: groupName,
        roleDetails: ConvertToRoleRequest(permissions),
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSaveCreate({
        roleName: groupName,
        roleDetails: ConvertToRoleRequest(permissions),
      });
    } else if (mode === "update") {
      if (!id) {
        alert("missing id");
        return;
      }

      const validationErrors = RoleValidate.create({
        roleName: groupName,
        roleDetails: ConvertToRoleRequest(permissions),
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSaveUpdate(id, {
        roleName: groupName,
        roleDetails: ConvertToRoleRequest(permissions),
      });
    }
  };

  return (
    <Overlay onClose={onCancel}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex max-h-[90vh] w-[1000px] flex-col gap-3 overflow-auto rounded-lg bg-background-paper pb-2",
          className
        )}
      >
        <div className="flex-bet-center border-b border-other-divider px-6 py-2">
          <h6 className="text-body-1 font-bold text-text-primary">
            {t("permissionForm.addPermissionGroup")}
          </h6>
          <Button
            variant="text"
            size="small"
            onClick={onCancel}
            className="min-w-0 p-1.5 text-text-secondary"
          >
            <Icon name="close" size={24} />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-0">
          <TextField
            label={t("permissionForm.groupName")}
            placeholder={t("permissionForm.groupNamePlaceholder")}
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
            }}
            className="w-full"
            error={errors.roleName}
          />

          <div className="rounded-md">
            <div className="w-full overflow-x-auto rounded-md border border-other-outlined-border bg-background-body-background">
              <table className="w-full text-left text-text-primary">
                {/* Header đồng bộ bg-action-focus và text-table-header */}
                <thead className="text-table-header bg-action-focus text-text-primary">
                  <tr>
                    <th className="px-6 py-2">
                      {t("permissionForm.permissionName")}
                    </th>
                    {permissionCols.map((col) => (
                      <th key={col.key} className="px-6 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleColAllClick(col.key)}
                          disabled={isView}
                          className="font-semibold uppercase transition-colors hover:text-primary-main focus:outline-none"
                        >
                          {col.title}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body đồng bộ divide màu border và hover effect */}
                <tbody className="text-body-2 divide-y divide-other-outlined-border border-b border-other-outlined-border">
                  {isLoading
                    ? defaultPermissions.map((_perm, i) => (
                        <tr key={i}>
                          {/* Cột tên */}
                          <td className="px-6 py-2">
                            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-300"></div>
                          </td>

                          {/* Các cột checkbox skeleton */}
                          {permissionCols.map((col) => (
                            <td key={col.key} className="px-6 py-2 text-center">
                              <div className="mx-auto h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    : permissions.map((row) => (
                        <tr
                          key={row.key}
                          className="transition-colors hover:bg-action-hover"
                        >
                          {/* Cột tên quyền - font-medium tương tự DynamicTable */}
                          <td className="px-6 py-2">
                            {t(`permissionNames.${row.key}`)}
                          </td>

                          {/* Các cột checkbox */}
                          {permissionCols.map((col) => (
                            <td key={col.key} className="px-6 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={row.actions[col.key]}
                                onChange={() =>
                                  handleCheckboxChange(row.key, col.key)
                                }
                                disabled={isView}
                                className="h-4.5 w-4.5 cursor-pointer rounded border-other-input-border accent-primary-main transition-all"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            {errors.roleDetails && (
              <div className="text-sm text-red-500">{errors.roleDetails}</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-2">
          <Button variant="outline" onClick={onCancel}>
            {t("common.back")}
          </Button>
          {!isView && (
            <Button type="submit" variant="contained" color="primary">
              {t("common.save")}
            </Button>
          )}
        </div>
      </form>
    </Overlay>
  );
};
