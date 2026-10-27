import { useTranslation } from "react-i18next";
import { AdminHeaderPanel } from "@/shared/components/admin";
import {
  PermissionDeniedAlert,
  QueryErrorAlert,
} from "@/shared/components/ui";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { SubjectDialog } from "@/features/catalogs/components/SubjectDialog";
import { SubjectFiltersPanel } from "@/features/catalogs/components/SubjectFiltersPanel";
import { SubjectStats } from "@/features/catalogs/components/SubjectStats";
import { SubjectTablePanel } from "@/features/catalogs/components/SubjectTablePanel";
import { useSubjectPageController } from "@/features/catalogs/hooks/useSubjectPageController";

export function SubjectPage() {
  const { t } = useTranslation("common");
  const page = useSubjectPageController();

  if (page.isPermissionLoading) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <div
          role="status"
          aria-live="polite"
          className="p-6 text-text-secondary"
        >
          {t("subjectPage.permissionLoading")}
        </div>
      </MainContentLayout>
    );
  }

  if (page.isPermissionError) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <QueryErrorAlert
          className="m-6"
          message={t("subjectPage.permissionLoadFailed")}
          onRetry={page.refetchPermissions}
          isRetrying={page.isPermissionFetching}
          retryLabel={t("subjectPage.retry")}
        />
      </MainContentLayout>
    );
  }

  if (!page.canView) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("subjectPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <section className="flex flex-col gap-5 lg:gap-6">
        <AdminHeaderPanel
          title={t("subjectPage.title")}
          description={t("subjectPage.description")}
        >
          <SubjectStats subjects={page.subjects} isLoading={page.isLoading} />
        </AdminHeaderPanel>

        <SubjectFiltersPanel
          searchTerm={page.searchTerm}
          searchBy={page.searchBy}
          canReset={page.searchTerm.length > 0 || page.searchBy !== "name"}
          onSearchChange={page.handleSearchChange}
          onSearchByChange={page.handleSearchByChange}
          onReset={page.resetFilters}
        />

        <SubjectTablePanel
          subjects={page.filteredSubjects}
          actions={page.actions}
          canUpdateChapters={page.canUpdateChapters}
          isLoading={page.isLoading}
          isFetching={page.isFetching}
          isError={page.isError}
          searchTerm={page.searchTerm}
          pagination={page.pagination}
          onRetry={page.retrySubjects}
          onAdd={page.openCreateModal}
          onAction={page.handleAction}
        />
      </section>

      {page.modalState.open && page.modalState.mode !== "none" && (
        <SubjectDialog
          key={`${page.modalState.mode}-${page.modalState.subject?.id ?? "new"}`}
          mode={page.modalState.mode}
          subject={page.modalState.subject}
          canUpdateSubject={page.canUpdateSubject}
          canCreateChapters={page.canCreateChapters}
          canUpdateChapters={page.canUpdateChapters}
          isSaving={page.isSaving}
          isSavingChapters={page.isSavingChapters}
          onClose={page.closeModal}
          onSaveCreate={page.handleCreate}
          onSaveUpdate={page.handleUpdate}
          onSaveChapters={page.handleSaveChapters}
          onDelete={page.handleDelete}
        />
      )}
    </MainContentLayout>
  );
}

export default SubjectPage;
