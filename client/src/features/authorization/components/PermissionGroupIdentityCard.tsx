import { useTranslation } from "react-i18next";
import type { Role } from "@/shared/types";
import { IdentityAvatar } from "@/shared/components/ui";
import { formatPermissionGroupCode } from "@/features/authorization/utils/permissionGroupList";
import { getDeclaredSystemRoleCode } from "@/shared/utils/role";

interface PermissionGroupIdentityCardProps {
  role: Role;
}

export function PermissionGroupIdentityCard({
  role,
}: PermissionGroupIdentityCardProps) {
  const { t } = useTranslation("common");
  const roleCode = getDeclaredSystemRoleCode(role.code);
  const roleName = roleCode
    ? t(`userPage.roles.${roleCode.toLowerCase()}`)
    : role.roleName;

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-other-divider bg-background-paper p-4 shadow-sm sm:p-5">
      <IdentityAvatar
        name={roleName}
        size="large"
        className="ring-4 ring-background-body"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-semibold text-text-primary">
          {roleName}
        </h3>
        <p className="mt-1 truncate text-sm text-text-secondary">
          {formatPermissionGroupCode(role)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-action-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
            {t(
              roleCode
                ? "permissionGroupPage.kind.system"
                : "permissionGroupPage.kind.custom"
            )}
          </span>
          <span className="rounded-full bg-action-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
            {t("permissionGroupPage.memberCount", {
              count: role.totalUsers ?? 0,
            })}
          </span>
        </div>
      </div>
    </section>
  );
}
