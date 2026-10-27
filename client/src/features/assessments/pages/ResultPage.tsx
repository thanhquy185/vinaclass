import { lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import Tabs from "@/shared/components/ui/Tabs/Tabs";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { QueryErrorAlert } from "@/shared/components/ui";
import ClassScoreResults from "@/features/assessments/components/result-table/ClassScoreResults";
import ExamResultHeader from "@/features/assessments/components/result-table/ExamResultHeader";
import ExamResultModal from "@/features/assessments/components/exam/ExamResultModal";
import { useResultPageController } from "@/features/assessments/hooks/useResultPageController";

const ExamStatistics = lazy(
  () => import("@/features/assessments/components/ExamStatistics"),
);

export default function ResultPage() {
  const { t } = useTranslation();
  const {
    exam,
    courseGroup,
    students,
    examResults,
    isLoadingStudents,
    isLoadingExamResults,
    isLoadingResultView,
    isFetchingResultView,
    queryIssues,
    status,
    selectedTab,
    viewMode,
    studentRows,
    sortOrder,
    searchBy,
    searchTerm,
    attemptStatusFilter,
    visibleTableData,
    pagination,
    handleTabChange,
    handleAttemptStatusFilterChange,
    handleSearchTermChange,
    handleSearchByChange,
    handleSortOrderChange,
    handleViewModeChange,
    handleResetFilters,
    hasActiveFilters,
    isResultModalOpen,
    closeResultModal,
    handleStartExam,
    handleViewResult,
    handleExportScores,
  } = useResultPageController();

  return (
    <MainContentLayout
      hasFooter={false}
      width="wide"
      className="w-full gap-5"
    >
      {queryIssues.length > 0 && (
        <div className="flex flex-col gap-2">
          {queryIssues.map((issue) => (
            <QueryErrorAlert
              key={issue.key}
              message={issue.message}
              retryLabel={t("courseElement.retry")}
              onRetry={issue.onRetry}
              isRetrying={issue.isRetrying}
            />
          ))}
        </div>
      )}

      <Link
        to="/tests"
        className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-background-paper hover:text-primary-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        {t("resultPage.actions.backToExams")}
      </Link>

      <ExamResultHeader
        examName={exam?.examName}
        courseGroupName={courseGroup?.groupName}
        subjectName={exam?.subject?.subjectName}
        questionCount={exam?.questions?.length ?? 0}
        status={status}
        onPreview={handleStartExam}
        canPreview={Boolean(exam?.questions?.length)}
      />

      <section className="overflow-hidden rounded-2xl border border-other-outlined-border bg-background-paper shadow-sm">
        <div className="border-b border-other-outlined-border px-4 sm:px-6">
          <Tabs
            value={selectedTab}
            onChange={(value) =>
              handleTabChange(value as "stat" | "classScore")
            }
            tabs={[
              { value: "classScore", label: t("resultPage.tabs.classScore") },
              { value: "stat", label: t("resultPage.tabs.stat") },
            ]}
            childClassName="!font-medium"
          />
        </div>

        {selectedTab === "classScore" && (
          <div className="p-4 sm:p-6">
            <ClassScoreResults
              viewMode={viewMode}
              sortOrder={sortOrder}
              attemptStatusFilter={attemptStatusFilter}
              searchBy={searchBy}
              searchTerm={searchTerm}
              canExportScores={viewMode === "user" && studentRows.length > 0}
              hasActiveFilters={hasActiveFilters}
              data={visibleTableData}
              isLoading={isLoadingResultView}
              isFetching={isFetchingResultView}
              pagination={pagination}
              onAttemptStatusFilterChange={handleAttemptStatusFilterChange}
              onSearchByChange={handleSearchByChange}
              onSearchTermChange={handleSearchTermChange}
              onSortOrderChange={handleSortOrderChange}
              onViewModeChange={handleViewModeChange}
              onResetFilters={handleResetFilters}
              onExportScores={handleExportScores}
              onViewResult={handleViewResult}
            />
          </div>
        )}

        {selectedTab === "stat" && (
          <Suspense
            fallback={
              <div className="flex min-h-48 items-center justify-center">
                <Spin tip={t("tableActions.loading")} />
              </div>
            }
          >
            <Spin spinning={isLoadingStudents || isLoadingExamResults}>
              <ExamStatistics
                students={students}
                examAttempts={
                  examResults?.examAttempts.map(
                    ({ examAttempt }) => examAttempt,
                  ) ?? []
                }
                key="stat-section"
              />
            </Spin>
          </Suspense>
        )}
      </section>

      {isResultModalOpen && <ExamResultModal onClose={closeResultModal} />}
    </MainContentLayout>
  );
}
