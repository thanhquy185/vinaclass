import { useTranslation } from "react-i18next";
import { AdminHeaderPanel, AdminTablePanel } from "@/shared/components/admin";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import Tabs from "@/shared/components/ui/Tabs/Tabs";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { QuestionBankFilterPanel } from "@/features/question-bank/components/QuestionBankFilterPanel";
import { QuestionBankStats } from "@/features/question-bank/components/QuestionBankStats";
import QuestionListPanel from "@/features/question-bank/components/QuestionListPanel";
import { TeacherQuestionWorkspace } from "@/features/question-bank/components/TeacherQuestionWorkspace";
import QuestionEditorForm from "@/features/question-bank/components/QuestionEditorForm";
import { useQuestionBankPageController } from "@/features/question-bank/hooks/useQuestionBankPageController";
import type { QuestionStatus } from "@/shared/types";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";

export const QuestionBankPage = () => {
  const { t } = useTranslation("common");
  const { user, role } = useAuthStore();
  const isTeacher = getAuthenticatedUserRoleCode(user, role) === "TEACHER";
  const page = useQuestionBankPageController();

  if (page.isPermissionLoading) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <div
          role="status"
          aria-live="polite"
          className="p-6 text-text-secondary"
        >
          {t("questionPage.permissionLoading")}
        </div>
      </MainContentLayout>
    );
  }

  if (page.isPermissionError) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <QueryErrorAlert
          className="m-6"
          message={t("questionPage.permissionLoadError")}
          onRetry={page.refetchPermissions}
          isRetrying={page.isPermissionFetching}
          retryLabel={t("questionPage.retry")}
        />
      </MainContentLayout>
    );
  }

  if (!page.canView) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("questionPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      {isTeacher ? (
        <TeacherQuestionWorkspace
          subjects={page.subjects}
          difficulties={page.difficulties}
          isLoadingSubjects={page.isLoadingSubjects}
          isLoadingDifficulties={page.isLoadingDifficulties}
          hasFilterError={page.hasFilterError}
          isRetryingFilterData={page.isFetchingFilterData}
          retryFilterData={page.retryFilterData}
          actions={page.actions}
          canView={page.canView}
          canCreate={page.canCreate}
          isPermissionLoading={page.isPermissionLoading}
          isLoadingQuestions={page.isLoadingQuestions}
          isQuestionError={page.isQuestionError}
          isFetchingQuestions={page.isFetchingQuestions}
          refetchQuestions={page.refetchQuestions}
          selectedTab={page.selectedTab}
          searchQuery={page.searchQuery}
          sortOrder={page.sortOrder}
          filterSubjectId={page.filterSubjectId}
          filterChapterId={page.filterChapterId}
          filterDifficultyId={page.filterDifficultyId}
          filteredQuestions={page.filteredQuestions}
          filteredQuestionCount={page.filteredQuestionCount}
          paginatedQuestions={page.paginatedQuestions}
          currentPage={page.currentPage}
          totalPages={page.totalPages}
          hasActiveFilters={page.hasActiveFilters}
          setCurrentPage={page.setCurrentPage}
          handleTabSelect={page.handleTabSelect}
          handleSubjectChange={(subjectId) => {
            page.handleSubjectChange(subjectId);
            page.handleDifficultyChange(-1);
          }}
          handleChapterChange={(chapterId) => {
            page.handleChapterChange(chapterId);
            page.handleDifficultyChange(-1);
          }}
          handleDifficultyChange={page.handleDifficultyChange}
          handleSearchChange={page.handleSearchChange}
          handleSortChange={page.handleSortChange}
          resetFilters={page.resetFilters}
          onCreate={page.openCreateModal}
          onEdit={page.openUpdateModal}
          onDelete={page.onDeleteQuestion}
          onAddToBank={page.onAddQuestionToBank}
          onPublish={page.onPublishQuestion}
          onArchive={page.onArchiveQuestion}
          onRestore={page.onRestoreQuestion}
          onMoveToPrivate={page.onMoveToPrivateQuestion}
        />
      ) : (
        <section className="flex flex-col gap-5 lg:gap-6">
          <AdminHeaderPanel
            title={t("questionPage.title")}
            description={t("questionPage.description")}
          >
            <QuestionBankStats
              stats={page.stats}
              isLoading={page.isLoadingQuestions && !page.stats.total}
            />
          </AdminHeaderPanel>

          <QuestionBankFilterPanel
            subjects={page.subjects}
            difficulties={page.difficulties}
            isLoadingSubjects={page.isLoadingSubjects}
            isLoadingDifficulties={page.isLoadingDifficulties}
            hasFilterError={page.hasFilterError}
            isRetryingFilterData={page.isFetchingFilterData}
            onRetryFilterData={page.retryFilterData}
            filterSubjectId={page.filterSubjectId}
            filterChapterId={page.filterChapterId}
            filterDifficultyId={page.filterDifficultyId}
            searchQuery={page.searchQuery}
            searchBy={page.searchBy}
            sortOrder={page.sortOrder}
            resultCount={page.filteredQuestionCount}
            hasActiveFilters={page.hasActiveFilters}
            onSubjectChange={page.handleSubjectChange}
            onChapterChange={page.handleChapterChange}
            onDifficultyChange={page.handleDifficultyChange}
            onSearchChange={page.handleSearchChange}
            onSearchByChange={page.handleSearchByChange}
            onSortChange={page.handleSortChange}
            onResetFilters={page.resetFilters}
          />

          <div id="question-list-top">
            <AdminTablePanel
              title={t("questionPage.tableTitle")}
              description={t("questionPage.tableDescription")}
              createAction={
                page.selectedTab === "private" && page.canCreate
                  ? {
                      label: t("questionPage.actions.addQuestion"),
                      onClick: page.openCreateModal,
                    }
                  : undefined
              }
            >
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-other-divider">
                  <Tabs
                    value={page.selectedTab}
                    onChange={(value) =>
                      page.handleTabSelect(value as QuestionStatus)
                    }
                    tabs={[
                      { value: "public", label: t("questionPage.tabs.public") },
                      {
                        value: "private",
                        label: t("questionPage.tabs.private"),
                      },
                      {
                        value: "archive",
                        label: t("questionPage.tabs.archive"),
                      },
                    ]}
                    small
                    className="max-w-full"
                    childClassName="whitespace-nowrap"
                  />
                </div>

                <QuestionListPanel
                  selectedTab={page.selectedTab}
                  actions={page.actions}
                  canView={page.canView}
                  isPermissionLoading={page.isPermissionLoading}
                  isLoadingQuestions={page.isLoadingQuestions}
                  isQuestionError={page.isQuestionError}
                  isFetchingQuestions={page.isFetchingQuestions}
                  refetchQuestions={page.refetchQuestions}
                  filteredQuestions={page.filteredQuestions}
                  paginatedQuestions={page.paginatedQuestions}
                  hasActiveFilters={page.hasActiveFilters}
                  currentPage={page.currentPage}
                  totalPages={page.totalPages}
                  onPageChange={page.setCurrentPage}
                  onResetFilters={page.resetFilters}
                  onEditQuestion={page.openUpdateModal}
                  onDeleteQuestion={page.onDeleteQuestion}
                  onAddQuestionToBank={page.onAddQuestionToBank}
                  onPublishQuestion={page.onPublishQuestion}
                  onArchiveQuestion={page.onArchiveQuestion}
                  onRestoreQuestion={page.onRestoreQuestion}
                  onMoveToPrivateQuestion={page.onMoveToPrivateQuestion}
                />
              </div>
            </AdminTablePanel>
          </div>
        </section>
      )}

      {page.modalState.open && (
        <QuestionEditorForm
          onClose={page.closeModal}
          selectedItem={page.modalState.selectedItem}
          onSaveCreate={page.handleCreate}
          onSaveUpdate={page.handleUpdate}
          mode={page.modalState.mode}
          variant={isTeacher ? "teacher" : "admin"}
          isSaving={page.isProcessing}
        />
      )}
    </MainContentLayout>
  );
};
