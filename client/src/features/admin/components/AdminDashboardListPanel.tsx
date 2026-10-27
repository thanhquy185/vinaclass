import { Empty, Spin } from "antd";
import { Fragment } from "react";
import type { Key, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AdminPanel } from "@/shared/components/admin";

interface AdminDashboardListPanelProps<Item> {
  title: string;
  viewAllPath: string;
  viewAllLabel: string;
  items: Item[];
  getItemKey: (item: Item) => Key;
  renderItem: (item: Item) => ReactNode;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  emptyDescription: string;
}

export function AdminDashboardListPanel<Item>({
  title,
  viewAllPath,
  viewAllLabel,
  items,
  getItemKey,
  renderItem,
  isLoading,
  isError,
  errorMessage,
  emptyDescription,
}: AdminDashboardListPanelProps<Item>) {
  return (
    <AdminPanel className="flex min-h-[340px] min-w-0 flex-col p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-body-1 font-semibold text-text-primary">{title}</h2>
        <Link
          className="text-body-2 font-medium text-primary-main hover:underline"
          to={viewAllPath}
        >
          {viewAllLabel}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spin />
        </div>
      ) : isError ? (
        <p className="text-body-2 flex min-h-48 items-center justify-center text-text-secondary">
          {errorMessage}
        </p>
      ) : items.length === 0 ? (
        <Empty className="my-auto py-8" description={emptyDescription} />
      ) : (
        <div className="divide-y divide-other-divider">
          {items.map((item) => (
            <Fragment key={getItemKey(item)}>{renderItem(item)}</Fragment>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
