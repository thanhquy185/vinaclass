import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AddNotificationForm from "@/features/classrooms/components/NotificationForm";
import { NotificationFiltersPanel } from "@/features/classrooms/components/NotificationFiltersPanel";
import { NotificationStats } from "@/features/classrooms/components/NotificationStats";
import { NotificationTablePanel } from "@/features/classrooms/components/NotificationTablePanel";
import { useNotificationPageController } from "@/features/classrooms/hooks/useNotificationPageController";
import { AdminHeaderPanel } from "@/shared/components/admin";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import MainContentLayout from "@/shared/layout/MainContentLayout";

export const NotificationPage = () => {
  const { t } = useTranslation("common");
  const page = useNotificationPageController();
  const currentPage = page.pagination.current;

  useEffect(() => {
    document
      .getElementById("notification-table-container")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  if (page.isPermissionLoading) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <div
          role="status"
          aria-live="polite"
          className="p-6 text-text-secondary"
        >
          {t("notificationPage.permissionLoading")}
        </div>
      </MainContentLayout>
    );
  }

  if (page.isPermissionError) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <QueryErrorAlert
          className="m-6"
          message={t("notificationPage.permissionLoadFailed")}
          onRetry={page.refetchPermissions}
          isRetrying={page.isPermissionFetching}
          retryLabel={t("notificationPage.retry")}
        />
      </MainContentLayout>
    );
  }

  if (!page.canView) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("notificationPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  const canResetFilters =
    page.hasActiveFilters || page.searchBy !== "all" || !page.newestFirst;

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <section className="flex flex-col gap-5 lg:gap-6">
        <AdminHeaderPanel
          title={t("notificationPage.title")}
          description={t("notificationPage.description")}
        >
          <NotificationStats
            notifications={page.notifications}
            isLoading={page.isLoading}
          />
        </AdminHeaderPanel>

        <NotificationFiltersPanel
          searchTerm={page.searchTerm}
          searchBy={page.searchBy}
          statusFilter={page.statusFilter}
          newestFirst={page.newestFirst}
          canReset={canResetFilters}
          onSearchChange={page.handleSearchChange}
          onSearchByChange={page.handleSearchByChange}
          onStatusChange={page.handleStatusChange}
          onToggleSort={page.toggleSortDirection}
          onReset={page.resetFilters}
        />

        <div id="notification-table-container">
          <NotificationTablePanel
            notifications={page.filteredNotifications}
            actions={page.actions}
            canCreate={page.canCreateNotification}
            isProcessing={page.isProcessing}
            isLoading={page.isLoading}
            isFetching={page.isFetching}
            isError={page.isError}
            hasActiveFilters={page.hasActiveFilters}
            pagination={page.pagination}
            onRetry={page.refetch}
            onAdd={() => page.openModal("create")}
            onAction={(action, notification) => {
              if (action === "detail") page.openViewModal(notification.id);
              if (action === "edit") page.openUpdateModal(notification.id);
              if (action === "remove") page.handleDelete(notification.id);
            }}
          />
        </div>
      </section>

      {page.modalState.open && (
        <AddNotificationForm
          onClose={page.closeModal}
          onSaveCreate={page.handleCreate}
          onSaveUpdate={page.handleUpdate}
          mode={page.modalState.mode}
          selectedItem={page.modalState.selectedItem}
          isSaving={page.isProcessing}
        />
      )}
    </MainContentLayout>
  );
};
