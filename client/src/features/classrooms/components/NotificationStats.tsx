import { FileText, MessageSquareText, Send, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NotificationResponse } from "@/features/classrooms/types/classrooms";
import { SummaryStatCard } from "@/shared/components/ui";

interface NotificationStatsProps {
  notifications: NotificationResponse[];
  isLoading: boolean;
}

export function NotificationStats({
  notifications,
  isLoading,
}: NotificationStatsProps) {
  const { t, i18n } = useTranslation("common");
  const sentNotifications = notifications.filter(
    (notification) => notification.status,
  );
  const stats = [
    {
      label: t("notificationPage.stats.total"),
      value: notifications.length,
      accent: "bg-primary-main",
      icon: <MessageSquareText size={19} />,
    },
    {
      label: t("notificationPage.stats.sent"),
      value: sentNotifications.length,
      accent: "bg-alert-success-content",
      icon: <Send size={19} />,
    },
    {
      label: t("notificationPage.stats.drafts"),
      value: notifications.length - sentNotifications.length,
      accent: "bg-alert-warning-content",
      icon: <FileText size={19} />,
    },
    {
      label: t("notificationPage.stats.classes"),
      value: new Set(
        sentNotifications.flatMap((notification) =>
          (notification.courseGroups ?? []).map((group) => group.id),
        ),
      ).size,
      accent: "bg-alert-info-content",
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
