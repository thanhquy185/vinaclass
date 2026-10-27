import { Button, Select, Tabs } from "antd";
import { useTranslation } from "react-i18next";
import type { Role, User } from "@/shared/types";
import { getDeclaredSystemRoleCode } from "@/shared/utils/role";
import type { PermissionMatrixTab } from "@/features/authorization/types/permissionMatrix";

interface PermissionMatrixToolbarProps {
  activeTab: PermissionMatrixTab;
  roles: Role[];
  users: User[];
  activeRoleId: number | null;
  activeUserId: number | null;
  isLoadingRoles: boolean;
  isLoadingUsers: boolean;
  isSaving: boolean;
  isSaveDisabled: boolean;
  onTabChange: (tab: PermissionMatrixTab) => void;
  onRoleChange: (roleId: number | null) => void;
  onUserChange: (userId: number | null) => void;
  onSave: () => void;
}

export function PermissionMatrixToolbar({
  activeTab,
  roles,
  users,
  activeRoleId,
  activeUserId,
  isLoadingRoles,
  isLoadingUsers,
  isSaving,
  isSaveDisabled,
  onTabChange,
  onRoleChange,
  onUserChange,
  onSave,
}: PermissionMatrixToolbarProps) {
  const { t } = useTranslation("common");
  const translationPrefix = "permissionGroupPage.matrix";
  const roleLabel = (role: Role) => {
    const roleCode = getDeclaredSystemRoleCode(role.code);
    return roleCode
      ? t(`userPage.roles.${roleCode.toLowerCase()}`)
      : role.roleName;
  };

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">
          {t(`${translationPrefix}.title`)}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {activeTab === "roles"
            ? t(`${translationPrefix}.descriptions.roles`)
            : t(`${translationPrefix}.descriptions.users`)}
        </p>
        <Tabs
          className="mt-4"
          activeKey={activeTab}
          onChange={(key) => {
            if (key === "roles" || key === "users") onTabChange(key);
          }}
          items={[
            { key: "roles", label: t(`${translationPrefix}.tabs.roles`) },
            { key: "users", label: t(`${translationPrefix}.tabs.users`) },
          ]}
        />
      </div>

      <div className="flex min-w-64 items-end gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm text-text-secondary">
          {activeTab === "roles"
            ? t(`${translationPrefix}.labels.role`)
            : t(`${translationPrefix}.labels.user`)}
          <Select
            showSearch
            optionFilterProp="label"
            className="w-full"
            value={
              activeTab === "roles"
                ? (activeRoleId ?? undefined)
                : (activeUserId ?? undefined)
            }
            disabled={
              activeTab === "roles"
                ? isLoadingRoles || roles.length === 0
                : isLoadingRoles || isLoadingUsers || users.length === 0
            }
            options={
              activeTab === "roles"
                ? roles.map((role) => ({
                    value: role.id,
                    label: roleLabel(role),
                  }))
                : users.map((user) => ({
                    value: user.id,
                    label: `${user.profile.fullName} (${user.username})`,
                  }))
            }
            onChange={(selectedId?: number) => {
              if (activeTab === "roles") onRoleChange(selectedId ?? null);
              else onUserChange(selectedId ?? null);
            }}
          />
        </label>
        <Button
          type="primary"
          loading={isSaving}
          disabled={isSaveDisabled}
          onClick={onSave}
        >
          {t(`${translationPrefix}.saveChanges`)}
        </Button>
      </div>
    </header>
  );
}
