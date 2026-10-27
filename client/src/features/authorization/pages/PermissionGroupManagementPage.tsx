import { useTranslation } from "react-i18next";
import { PermissionGroupDeleteDialog } from "@/features/authorization/components/PermissionGroupDeleteDialog";
import { PermissionForm } from "@/features/authorization/components/PermissionForm";
import { PermissionGroupFiltersPanel } from "@/features/authorization/components/PermissionGroupFiltersPanel";
import { PermissionGroupStats } from "@/features/authorization/components/PermissionGroupStats";
import { PermissionGroupTable } from "@/features/authorization/components/PermissionGroupTable";
import { usePermissionGroupPageController } from "@/features/authorization/hooks/usePermissionGroupPageController";
import { AdminHeaderPanel } from "@/shared/components/admin";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import MainContentLayout from "@/shared/layout/MainContentLayout";

export function PermissionGroupManagementPage() {
  const { t } = useTranslation("common");
  const page = usePermissionGroupPageController();

  if (page.isPermissionLoading) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <div
          role="status"
          aria-live="polite"
          className="p-6 text-text-secondary"
        >
          {t("permissionGroupPage.permissionLoading")}
        </div>
      </MainContentLayout>
    );
  }

  if (page.isPermissionError) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <QueryErrorAlert
          className="m-6"
          message={t("permissionGroupPage.permissionLoadFailed")}
          onRetry={page.refetchPermissions}
          isRetrying={page.isPermissionFetching}
          retryLabel={t("permissionGroupPage.retry")}
        />
      </MainContentLayout>
    );
  }

  if (!page.canView) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("permissionGroupPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <section className="flex flex-col gap-5 lg:gap-6">
        <AdminHeaderPanel
          title={t("permissionGroupPage.pageTitle")}
          description={t("permissionGroupPage.pageDescription")}
        >
          <PermissionGroupStats roles={page.roles} isLoading={page.isLoading} />
        </AdminHeaderPanel>

        <PermissionGroupFiltersPanel
          searchTerm={page.searchTerm}
          searchBy={page.searchBy}
          kind={page.kind}
          sortDirection={page.sortDirection}
          canReset={
            page.searchTerm.length > 0 ||
            page.searchBy !== "name" ||
            page.kind !== "all" ||
            page.sortDirection !== null
          }
          onSearchChange={page.setSearchTerm}
          onSearchByChange={page.setSearchBy}
          onKindChange={page.setKind}
          onToggleSort={() =>
            page.setSortDirection((direction) =>
              direction === "asc" ? "desc" : "asc"
            )
          }
          onReset={() => {
            page.setSearchTerm("");
            page.setSearchBy("name");
            page.setKind("all");
            page.setSortDirection(null);
          }}
        />

        <PermissionGroupTable
          roles={page.filteredRoles}
          actions={page.actions}
          isLoading={page.isLoading}
          isFetching={page.isFetching}
          isError={page.isError}
          onRetry={page.refetchRoles}
          onAdd={page.openCreateModal}
          onAction={page.handleAction}
          pagination={page.pagination}
        />
      </section>

      {page.modalState.open &&
        page.modalState.mode !== "delete" &&
        page.modalState.mode !== "none" && (
          <PermissionForm
            mode={page.modalState.mode}
            id={page.modalState.id}
            role={page.selectedRole ?? undefined}
            isSaving={page.isSaving}
            onSaveCreate={page.createRole}
            onSaveUpdate={page.updateRole}
            onCancel={page.closeModal}
          />
        )}
      {page.modalState.mode === "delete" && page.selectedRole && (
        <PermissionGroupDeleteDialog
          role={page.selectedRole}
          isDeleting={page.isDeleting}
          onClose={page.closeModal}
          onDelete={page.removeRole}
        />
      )}
    </MainContentLayout>
  );
}
