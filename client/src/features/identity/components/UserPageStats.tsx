import { useTranslation } from "react-i18next";
import type { Role } from "@/shared/types";
import type { User } from "@/features/identity/types/identity";
import { getUserSystemRoleCode } from "@/shared/utils/role";
import { Icon, SummaryStatCard } from "@/shared/components/ui";

interface UserPageStatsProps {
  users: User[];
  roles: Role[];
  isLoading: boolean;
}

export default function UserPageStats({
  users,
  roles,
  isLoading,
}: UserPageStatsProps) {
  const { t, i18n } = useTranslation("common");
  const stats = [
    {
      label: t("userPage.stats.total"),
      value: users.length,
      accent: "bg-primary-main",
      icon: "users" as const,
    },
    {
      label: t("userPage.stats.teachers"),
      value: users.filter(
        (user) => getUserSystemRoleCode(user, roles) === "TEACHER"
      ).length,
      accent: "bg-alert-info-content",
      icon: "academyCap" as const,
    },
    {
      label: t("userPage.stats.students"),
      value: users.filter(
        (user) => getUserSystemRoleCode(user, roles) === "STUDENT"
      ).length,
      accent: "bg-alert-success-content",
      icon: "groupUser" as const,
    },
    {
      label: t("userPage.stats.locked"),
      value: users.filter((user) => user.isLocked).length,
      accent: "bg-alert-error-content",
      icon: "lock" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
      {stats.map((stat) => (
        <SummaryStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value.toLocaleString(i18n.language)}
          accentClassName={stat.accent}
          isLoading={isLoading}
          icon={<Icon name={stat.icon} size={20} />}
        />
      ))}
    </div>
  );
}
