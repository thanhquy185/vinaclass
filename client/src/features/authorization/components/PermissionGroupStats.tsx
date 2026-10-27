import { KeyRound, ShieldCheck, ShieldPlus, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Role } from "@/shared/types";
import { SummaryStatCard } from "@/shared/components/ui";
import { isSystemPermissionGroup } from "@/features/authorization/utils/permissionGroupList";

interface PermissionGroupStatsProps {
  roles: Role[];
  isLoading: boolean;
}

export function PermissionGroupStats({
  roles,
  isLoading,
}: PermissionGroupStatsProps) {
  const { t, i18n } = useTranslation("common");
  const systemRoles = roles.filter(isSystemPermissionGroup);
  const customRoles = roles.length - systemRoles.length;
  const assignedUsers = roles.reduce(
    (total, role) => total + (role.totalUsers ?? 0),
    0
  );
  const stats = [
    {
      label: t("permissionGroupPage.stats.total"),
      value: roles.length,
      accent: "bg-primary-main",
      icon: <KeyRound size={19} />,
    },
    {
      label: t("permissionGroupPage.stats.system"),
      value: systemRoles.length,
      accent: "bg-alert-info-content",
      icon: <ShieldCheck size={19} />,
    },
    {
      label: t("permissionGroupPage.stats.custom"),
      value: customRoles,
      accent: "bg-alert-success-content",
      icon: <ShieldPlus size={19} />,
    },
    {
      label: t("permissionGroupPage.stats.assignedUsers"),
      value: assignedUsers,
      accent: "bg-alert-warning-content",
      icon: <UsersRound size={19} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {stats.map((stat) => (
        <SummaryStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value.toLocaleString(i18n.language)}
          accentClassName={stat.accent}
          isLoading={isLoading}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
