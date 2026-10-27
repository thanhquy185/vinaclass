import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TableColumn } from "@/shared/components/DataTable";
import type { Role } from "@/shared/types";
import type { User } from "@/features/identity/types/identity";
import { cn } from "@/shared/utils/cn";
import { IdentityAvatar } from "@/shared/components/ui";
import { getDeclaredSystemRoleCode } from "@/shared/utils/role";
import { formatIdentityDate } from "@/features/identity/utils/userDisplay";

export function useUserTableColumns(roles: Role[]): TableColumn<User>[] {
  const { t, i18n } = useTranslation("common");

  return useMemo(
    () => [
      {
        title: t("userPage.table.user"),
        key: "profile",
        id: "user",
        fixed: "left",
        width: 280,
        render: (_, user) => (
          <div className="flex min-w-[230px] items-center gap-3">
            <IdentityAvatar
              name={user.profile.fullName || user.username}
              avatarUrl={user.profile.avatarUrl}
              size="small"
              className="border border-other-divider"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-text-primary">
                {user.profile.fullName || user.username}
              </span>
              <span className="text-caption truncate text-text-secondary">
                {user.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        title: t("userPage.table.username"),
        key: "username",
        width: 170,
      },
      {
        title: t("userPage.table.dateOfBirth"),
        key: "profile",
        id: "dateOfBirth",
        width: 145,
        render: (_, user) => {
          return formatIdentityDate(user.profile.dateOfBirth, i18n.language);
        },
      },
      {
        title: t("userPage.table.gender"),
        key: "profile",
        id: "gender",
        width: 110,
        render: (_, user) =>
          user.profile.isFemale ? t("userForm.female") : t("userForm.male"),
      },
      {
        title: t("userPage.table.role"),
        key: "roleId",
        width: 155,
        render: (_, user) => {
          const assignedRole = roles.find((role) => role.id === user.roleId);
          const roleCode = getDeclaredSystemRoleCode(
            assignedRole &&
              Object.prototype.hasOwnProperty.call(assignedRole, "code")
              ? assignedRole.code
              : user.roleCode
          );
          let label =
            assignedRole?.roleName ??
            (user.roleId !== null ? t("userPage.roles.assigned") : "—");
          let roleClass = "text-text-primary";

          switch (roleCode) {
            case "ADMIN":
              label = t("userPage.roles.admin");
              roleClass = "text-alert-error-content";
              break;
            case "TEACHER":
              label = t("userPage.roles.teacher");
              roleClass = "text-alert-info-content";
              break;
            case "STUDENT":
              label = t("userPage.roles.student");
              roleClass = "text-alert-success-content";
              break;
          }

          return (
            <span className={cn("whitespace-nowrap font-medium", roleClass)}>
              {label}
            </span>
          );
        },
      },
      {
        title: t("userPage.table.joinDate"),
        key: "createdAt",
        width: 165,
        render: (_, user) =>
          formatIdentityDate(user.createdAt, i18n.language, true),
      },
      {
        title: t("userPage.table.status"),
        key: "isLocked",
        width: 125,
        render: (value) => {
          const isLocked = Boolean(value);
          return (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold leading-none",
                !isLocked
                  ? "bg-custom-background-success-background text-alert-success-content"
                  : "bg-custom-background-error-background text-alert-error-content"
              )}
            >
              {t(
                !isLocked ? "userPage.status.active" : "userPage.status.locked"
              )}
            </span>
          );
        },
      },
    ],
    [i18n.language, roles, t]
  );
}
