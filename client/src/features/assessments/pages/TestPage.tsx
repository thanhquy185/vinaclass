import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import { Spin } from "antd";
import ExamListToolbar from "@/features/assessments/components/ExamListToolbar";
import ExamListContent from "@/features/assessments/components/ExamListContent";
import { ExamManagementStats } from "@/features/assessments/components/ExamManagementStats";
import { AdminHeaderPanel, AdminTablePanel } from "@/shared/components/admin";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTestPageController } from "@/features/assessments/hooks/useTestPageController";
import { TeacherExamWorkspace } from "@/features/assessments/components/TeacherExamWorkspace";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";

export const TestPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const isTeacher = getAuthenticatedUserRoleCode(user, role) === "TEACHER";
  const {
    actions,
    canView,
    canCreate,
    isPermissionV2Enabled,
    isPermissionLoading,
    isPermissionError,
    refetchPermissions,
    examsQuery,
    examList,
  } = useTestPageController();
  const {
    exams,
    isLoading,
    isFetching,
    isError,
    refetch: refetchExams,
  } = examsQuery;

  if (isPermissionV2Enabled && isPermissionLoading) {
    return (
      <MainContentLayout>
        <div className="flex min-h-48 items-center justify-center rounded-md bg-background-body-background">
          <Spin tip={t("testPage.permissionLoading")} />
        </div>
      </MainContentLayout>
    );
  }

  if (isPermissionV2Enabled && isPermissionError) {
    return (
      <MainContentLayout>
        <QueryErrorAlert
          message={t("testPage.permissionLoadError")}
          retryLabel={t("testPage.retry")}
          onRetry={refetchPermissions}
          isRetrying={isPermissionLoading}
        />
      </MainContentLayout>
    );
  }

  if (!canView) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("testPage.noViewPermission")}
        />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      {isTeacher ? (
        <TeacherExamWorkspace
          exams={exams}
          filteredExams={examList.filteredExams}
          currentExams={examList.currentExams}
          actions={actions}
          canCreate={canCreate}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          searchTerm={examList.searchTerm}
          searchBy={examList.searchBy}
          selectedSubject={examList.selectedSubject}
          statusFilter={examList.statusFilter}
          subjects={examList.subjects}
          currentPage={examList.currentPage}
          totalPages={examList.totalPages}
          now={examList.now}
          hasActiveFilters={examList.hasActiveFilters}
          onSearchChange={examList.updateSearchTerm}
          onSearchByChange={examList.updateSearchBy}
          onSubjectChange={examList.updateSelectedSubject}
          onStatusChange={examList.updateStatusFilter}
          onPageChange={examList.setCurrentPage}
          onReset={examList.resetFilters}
          onRetry={refetchExams}
        />
      ) : (
        <section className="flex flex-col gap-5 lg:gap-6">
          <AdminHeaderPanel
            title={t("testPage.title")}
            description={t("testPage.description")}
          >
            <ExamManagementStats
              exams={exams}
              isLoading={isLoading}
              now={examList.now}
            />
          </AdminHeaderPanel>

          <ExamListToolbar
            searchTerm={examList.searchTerm}
            searchBy={examList.searchBy}
            selectedSubject={examList.selectedSubject}
            statusFilter={examList.statusFilter}
            dateTimeRange={examList.dateTimeRange}
            isNewestFirst={examList.isNewestFirst}
            subjects={examList.subjects}
            resultCount={examList.filteredExams.length}
            hasActiveFilters={examList.hasActiveFilters}
            onSearchChange={examList.updateSearchTerm}
            onSearchByChange={examList.updateSearchBy}
            onSubjectChange={examList.updateSelectedSubject}
            onStatusChange={examList.updateStatusFilter}
            onDateTimeRangeChange={examList.updateDateTimeRange}
            onToggleSort={examList.toggleSortOrder}
            onResetFilters={examList.resetFilters}
          />

          <div id="test-list-top">
            <AdminTablePanel
              title={t("testPage.tableTitle")}
              description={t("testPage.tableDescription")}
              createAction={
                canCreate
                  ? {
                      label: t("testPage.addNew"),
                      onClick: () => navigate("/tests/add"),
                    }
                  : undefined
              }
            >
              <ExamListContent
                canView={canView}
                actions={actions}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                refetchExams={refetchExams}
                filteredExams={examList.filteredExams}
                currentExams={examList.currentExams}
                hasActiveFilters={examList.hasActiveFilters}
                currentPage={examList.currentPage}
                totalPages={examList.totalPages}
                onPageChange={examList.setCurrentPage}
                onResetFilters={examList.resetFilters}
              />
            </AdminTablePanel>
          </div>
        </section>
      )}
    </MainContentLayout>
  );
};
