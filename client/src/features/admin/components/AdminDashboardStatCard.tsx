import type { IconName } from "@/assets";
import { Icon } from "@/shared/components/ui";
import { Spin } from "antd";
import { Link } from "react-router-dom";
import { AdminPanel } from "@/shared/components/admin";

export interface AdminDashboardStatCardProps {
  title: string;
  value: number;
  icon: IconName;
  colorClass: string;
  to: string;
  isLoading: boolean;
  isError: boolean;
  locale: string;
}

export function AdminDashboardStatCard({
  title,
  value,
  icon,
  colorClass,
  to,
  isLoading,
  isError,
  locale,
}: AdminDashboardStatCardProps) {
  return (
    <Link
      to={to}
      className="group block min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2"
    >
      <AdminPanel
        as="article"
        className="flex min-h-[124px] items-center gap-4 p-5 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-primary-main group-hover:shadow-md sm:gap-5 sm:p-6"
      >
        <div className={`shrink-0 rounded-xl p-3 ${colorClass}`}>
          <Icon name={icon} className="text-primary-contrast" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body-2 font-medium text-text-secondary">{title}</p>
          <p className="mt-1 text-[30px] font-semibold leading-9 text-text-primary">
            {isLoading ? (
              <Spin size="small" />
            ) : isError ? (
              "—"
            ) : (
              value.toLocaleString(locale)
            )}
          </p>
        </div>
        <Icon
          name="chevronRight"
          size={18}
          className="shrink-0 text-text-disabled transition-transform group-hover:translate-x-1 group-hover:text-primary-main"
        />
      </AdminPanel>
    </Link>
  );
}
