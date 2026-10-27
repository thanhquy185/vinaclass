import { useTranslation } from "react-i18next";
import AddAssignmentForm from "@/features/teacher-assignments/components/AssignmentForm";
import AssignmentFiltersPanel from "@/features/teacher-assignments/components/AssignmentFiltersPanel";
import AssignmentListPanel from "@/features/teacher-assignments/components/AssignmentListPanel";
import { AssignmentStats } from "@/features/teacher-assignments/components/AssignmentStats";
import { TeacherAssignmentWorkspace } from "@/features/teacher-assignments/components/TeacherAssignmentWorkspace";
import { AdminHeaderPanel } from "@/shared/components/admin";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { useAssignmentPageController } from "@/features/teacher-assignments/hooks/useAssignmentPageController";

export function AssignmentPage() {
  const { t } = useTranslation("common");
  const page = useAssignmentPageController();

  if (page.isPermissionLoading) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <div role="status" aria-live="polite" className="p-6 text-text-secondary">
          {t("assignmentPage.permissionLoading")}
        </div>
      </MainContentLayout>
    );
  }

  if (page.isPermissionError) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <QueryErrorAlert
          className="m-6"
          message={t("assignmentPage.permissionLoadFailed")}
          onRetry={page.refetchPermissions}
          isRetrying={page.isPermissionFetching}
          retryLabel={t("assignmentPage.retry")}
        />
      </MainContentLayout>
    );
  }

  if (!page.canView) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("assignmentPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  if (page.isTeacher) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <TeacherAssignmentWorkspace
          subjects={page.groups[0]?.subjects ?? []}
          stats={page.stats}
          searchTerm={page.searchTerm}
          canReset={page.searchTerm.length > 0}
          isLoading={page.isLoading}
          isFetching={page.isFetching}
          isError={page.isError}
          onSearch={page.handleSearchTermChange}
          onReset={page.resetFilters}
          onRetry={page.retryLoading}
        />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <section className="flex flex-col gap-5 lg:gap-6">
        <AdminHeaderPanel
          title={t("assignmentPage.title")}
          description={
            page.isAdmin
              ? t("assignmentPage.adminDescription")
              : t("assignmentPage.teacherDescription")
          }
        >
          <AssignmentStats stats={page.stats} isLoading={page.isLoading} />
        </AdminHeaderPanel>

        <AssignmentFiltersPanel
          isTeacher={page.isTeacher}
          searchBy={page.searchBy}
          searchTerm={page.searchTerm}
          canReset={
            page.searchTerm.length > 0 ||
            page.searchBy !== (page.isTeacher ? "subject" : "teacher")
          }
          onSearchByChange={page.handleSearchByChange}
          onSearchTermChange={page.handleSearchTermChange}
          onReset={page.resetFilters}
        />

        <AssignmentListPanel
          groups={page.groups}
          canAssign={page.canAssign}
          canDelete={page.canDelete}
          searchTerm={page.searchTerm}
          isLoading={page.isLoading}
          isFetching={page.isFetching}
          isError={page.isError}
          onRetry={page.retryLoading}
          onAdd={page.openModal}
          onRemove={page.handleRemoveAssignment}
          pagination={page.pagination}
        />
      </section>

      {page.isAdmin && page.isModalOpen && (
        <AddAssignmentForm
          isOpen={page.isModalOpen}
          onClose={page.closeModal}
          onSave={page.handleSave}
          assignments={page.assignments}
          isSaving={page.isCreating}
        />
      )}
    </MainContentLayout>
  );
}

export default AssignmentPage;
