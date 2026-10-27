import { useTranslation } from "react-i18next";
import { AdminHeaderPanel } from "@/shared/components/admin";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { DifficultyLevelDialog } from "@/features/catalogs/components/DifficultyLevelDialog";
import { DifficultyLevelFiltersPanel } from "@/features/catalogs/components/DifficultyLevelFiltersPanel";
import { DifficultyLevelStats } from "@/features/catalogs/components/DifficultyLevelStats";
import { DifficultyLevelTablePanel } from "@/features/catalogs/components/DifficultyLevelTablePanel";
import { TeacherDifficultyDialog } from "@/features/catalogs/components/TeacherDifficultyDialog";
import { TeacherDifficultyWorkspace } from "@/features/catalogs/components/TeacherDifficultyWorkspace";
import { useDifficultyLevelPageController } from "@/features/catalogs/hooks/useDifficultyLevelPageController";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";

export default function DifficultyLevelPage() {
  const { t } = useTranslation("common");
  const page = useDifficultyLevelPageController();
  const { user, role } = useAuthStore();
  const isTeacher = getAuthenticatedUserRoleCode(user, role) === "TEACHER";

  if (page.isPermissionLoading) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <div
          role="status"
          aria-live="polite"
          className="p-6 text-text-secondary"
        >
          {t("difficultyLevelPage.permissionLoading")}
        </div>
      </MainContentLayout>
    );
  }

  if (page.isPermissionError) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <QueryErrorAlert
          className="m-6"
          message={t("difficultyLevelPage.permissionLoadFailed")}
          onRetry={page.refetchPermissions}
          isRetrying={page.isPermissionFetching}
          retryLabel={t("difficultyLevelPage.retry")}
        />
      </MainContentLayout>
    );
  }

  if (!page.canView) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("difficultyLevelPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      {isTeacher ? (
        <TeacherDifficultyWorkspace
          difficulties={page.difficulties}
          filteredDifficulties={page.filteredDifficulties}
          actions={page.actions}
          isLoading={page.isLoading}
          isFetching={page.isFetching}
          isError={page.isError}
          searchTerm={page.searchTerm}
          searchBy={page.searchBy}
          pagination={page.pagination}
          onSearchTermChange={page.handleSearchTermChange}
          onSearchByChange={page.handleSearchByChange}
          onReset={page.resetFilters}
          onRetry={page.retryDifficulties}
          onAdd={page.openCreateModal}
          onAction={page.handleAction}
        />
      ) : (
        <section className="flex flex-col gap-5 lg:gap-6">
          <AdminHeaderPanel
            title={t("difficultyLevelPage.title")}
            description={t("difficultyLevelPage.description")}
          >
            <DifficultyLevelStats
              difficulties={page.difficulties}
              isLoading={page.isLoading}
            />
          </AdminHeaderPanel>

          <DifficultyLevelFiltersPanel
            searchTerm={page.searchTerm}
            searchBy={page.searchBy}
            canReset={page.searchTerm.length > 0 || page.searchBy !== "name"}
            onSearchChange={page.handleSearchTermChange}
            onSearchByChange={page.handleSearchByChange}
            onReset={page.resetFilters}
          />

          <DifficultyLevelTablePanel
            difficulties={page.filteredDifficulties}
            actions={page.actions}
            isLoading={page.isLoading}
            isFetching={page.isFetching}
            isError={page.isError}
            searchTerm={page.searchTerm}
            pagination={page.pagination}
            onRetry={page.retryDifficulties}
            onAdd={page.openCreateModal}
            onAction={page.handleAction}
          />
        </section>
      )}

      {page.modalState.open &&
        page.modalState.mode !== "none" &&
        (isTeacher ? (
          <TeacherDifficultyDialog
            key={`teacher-${page.modalState.mode}-${page.modalState.difficulty?.id ?? "new"}`}
            mode={page.modalState.mode}
            difficulty={page.modalState.difficulty}
            isSaving={page.isProcessing}
            onClose={page.closeModal}
            onSaveCreate={page.handleCreate}
            onSaveUpdate={page.handleUpdate}
            onDelete={page.handleDelete}
          />
        ) : (
          <DifficultyLevelDialog
            key={`admin-${page.modalState.mode}-${page.modalState.difficulty?.id ?? "new"}`}
            mode={page.modalState.mode}
            difficulty={page.modalState.difficulty}
            isSaving={page.isProcessing}
            onClose={page.closeModal}
            onSaveCreate={page.handleCreate}
            onSaveUpdate={page.handleUpdate}
            onDelete={page.handleDelete}
          />
        ))}
    </MainContentLayout>
  );
}
