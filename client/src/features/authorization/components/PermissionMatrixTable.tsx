import { Checkbox, Select, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type {
  PermissionMatrixFunction,
  PermissionMatrixItem,
} from "@/shared/types";

type MatrixTab = "roles" | "users";
type OverrideEffect = "GRANT" | "DENY";

interface PermissionMatrixTableProps {
  functions: PermissionMatrixFunction[];
  activeTab: MatrixTab;
  isAdminRole: boolean;
  activeIsAdmin: boolean;
  actionCodes: string[];
  selectedPermissionIds: number[];
  selectedOverrides: Record<number, OverrideEffect>;
  functionLabel: (feature: PermissionMatrixFunction) => string;
  permissionLabel: (permission: PermissionMatrixItem) => string;
  onTogglePermission: (permissionId: number) => void;
  onToggleFeature: (permissionIds: number[], shouldGrant: boolean) => void;
  onChangeOverride: (permissionId: number, effect: "" | OverrideEffect) => void;
}

export const PermissionMatrixTable = ({
  functions,
  activeTab,
  isAdminRole,
  activeIsAdmin,
  actionCodes,
  selectedPermissionIds,
  selectedOverrides,
  functionLabel,
  permissionLabel,
  onTogglePermission,
  onToggleFeature,
  onChangeOverride,
}: PermissionMatrixTableProps) => {
  const { t } = useTranslation("common");
  const translationPrefix = "permissionGroupPage.matrix";
  const isDisabled = activeIsAdmin || (activeTab === "roles" && isAdminRole);

  const columns: TableColumnsType<PermissionMatrixFunction> = [
    {
      title: t(`${translationPrefix}.labels.function`),
      key: "function",
      width: 280,
      render: (_value, feature) => {
        const assignablePermissions = feature.permissions.filter(
          (permission) => permission.assignable !== false
        );
        const permissionIds = assignablePermissions.map(({ id }) => id);
        const selectedCount = assignablePermissions.filter(({ id }) =>
          selectedPermissionIds.includes(id)
        ).length;
        const isFeatureSelected =
          permissionIds.length > 0 && selectedCount === permissionIds.length;

        return (
          <div className="flex items-center gap-3">
            {activeTab === "roles" && (
              <Checkbox
                checked={isFeatureSelected}
                indeterminate={selectedCount > 0 && !isFeatureSelected}
                disabled={isDisabled || permissionIds.length === 0}
                aria-label={t(`${translationPrefix}.selectAllPermissions`, {
                  name: functionLabel(feature),
                })}
                onChange={(event) =>
                  onToggleFeature(permissionIds, event.target.checked)
                }
              />
            )}
            <span className="font-medium text-text-primary">
              {functionLabel(feature)}
            </span>
          </div>
        );
      },
    },
    ...actionCodes.map((actionCode) => ({
      title:
        t(`${translationPrefix}.actions.${actionCode}`, {
          defaultValue: actionCode,
        }) || actionCode,
      key: actionCode,
      align: "center" as const,
      width: activeTab === "roles" ? 140 : 230,
      render: (_value: unknown, feature: PermissionMatrixFunction) => {
        const permission = feature.permissions.find(
          (item) => item.actionCode === actionCode
        );
        if (!permission) {
          return (
            <span className="text-text-disabled">
              {t(`${translationPrefix}.labels.configuredActions`)}
            </span>
          );
        }

        if (activeTab === "roles") {
          return (
            <Tooltip
              title={
                permission.assignable === false
                  ? t(`${translationPrefix}.labels.unavailableForRole`)
                  : undefined
              }
            >
              <div className="flex justify-center">
                <Checkbox
                  checked={selectedPermissionIds.includes(permission.id)}
                  disabled={isDisabled || permission.assignable === false}
                  aria-label={`${functionLabel(feature)}: ${permissionLabel(permission)}`}
                  onChange={() => onTogglePermission(permission.id)}
                />
              </div>
            </Tooltip>
          );
        }

        const selectedOverride = selectedOverrides[permission.id];
        const isAllowed = selectedOverride
          ? selectedOverride === "GRANT"
          : permission.grantedByRole;

        return (
          <div className="flex min-w-52 items-center justify-center gap-2">
            <Tooltip
              title={
                permission.assignable === false
                  ? t(`${translationPrefix}.labels.unavailableForRole`)
                  : undefined
              }
            >
              <span className="inline-flex">
                <Select
                  size="small"
                  value={selectedOverride ?? ""}
                  disabled={isDisabled || permission.assignable === false}
                  aria-label={t(`${translationPrefix}.overrideFor`, {
                    name: `${functionLabel(feature)}: ${permissionLabel(permission)}`,
                  })}
                  className="min-w-40 text-left"
                  options={[
                    {
                      value: "",
                      label: t(`${translationPrefix}.labels.inherit`),
                    },
                    {
                      value: "GRANT",
                      label: t(`${translationPrefix}.labels.grant`),
                    },
                    {
                      value: "DENY",
                      label: t(`${translationPrefix}.labels.deny`),
                    },
                  ]}
                  onChange={(effect: "" | OverrideEffect) =>
                    onChangeOverride(permission.id, effect)
                  }
                />
              </span>
            </Tooltip>
            <Tag color={isAllowed ? "success" : "default"}>
              {isAllowed
                ? t(`${translationPrefix}.labels.allowed`)
                : t(`${translationPrefix}.labels.denied`)}
            </Tag>
          </div>
        );
      },
    })),
  ];

  return (
    <Table<PermissionMatrixFunction>
      rowKey="id"
      size="middle"
      bordered
      pagination={false}
      columns={columns}
      dataSource={functions}
      scroll={{ x: "max-content" }}
    />
  );
};
