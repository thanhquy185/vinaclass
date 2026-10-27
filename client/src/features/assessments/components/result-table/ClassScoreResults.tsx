import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/shared/components/ui";
import DataTable from "@/shared/components/DataTable";
import type {
  AttemptStatusFilter,
  ResultSearchCriterion,
  ResultSortOrder,
  ResultTableRow,
  ResultViewMode,
} from "@/features/assessments/utils/buildResultTableData";
import { buildResultTableColumns } from "@/features/assessments/components/result-table/resultTableColumns";
import ResultTableControls from "@/features/assessments/components/result-table/ResultTableControls";

interface ClassScoreResultsProps {
  viewMode: ResultViewMode;
  sortOrder: ResultSortOrder;
  attemptStatusFilter: AttemptStatusFilter;
  searchBy: ResultSearchCriterion;
  searchTerm: string;
  canExportScores: boolean;
  hasActiveFilters: boolean;
  data: ResultTableRow[];
  isLoading: boolean;
  isFetching: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onAttemptStatusFilterChange: (filter: AttemptStatusFilter) => void;
  onSearchByChange: (criterion: ResultSearchCriterion) => void;
  onSearchTermChange: (searchTerm: string) => void;
  onSortOrderChange: (sortOrder: ResultSortOrder) => void;
  onViewModeChange: (viewMode: ResultViewMode) => void;
  onResetFilters: () => void;
  onExportScores: () => void;
  onViewResult: (examAttemptId: number) => void;
}

export default function ClassScoreResults({
  viewMode,
  sortOrder,
  attemptStatusFilter,
  searchBy,
  searchTerm,
  canExportScores,
  hasActiveFilters,
  data,
  isLoading,
  isFetching,
  pagination,
  onAttemptStatusFilterChange,
  onSearchByChange,
  onSearchTermChange,
  onSortOrderChange,
  onViewModeChange,
  onResetFilters,
  onExportScores,
  onViewResult,
}: ClassScoreResultsProps) {
  const { t } = useTranslation();

  const columns = useMemo(
    () =>
      buildResultTableColumns(viewMode, {
        studentId: t("resultPage.columns.studentId"),
        fullName: t("resultPage.columns.fullName"),
        percent: t("resultPage.columns.percent"),
        score: t("resultPage.columns.score"),
        startTime: t("resultPage.columns.startTime"),
        switchCount: t("resultPage.columns.switchCount"),
        avatarAlt: t("resultPage.avatarAlt"),
        questionNumber: t("resultPage.columns.stt"),
        difficultyLevel: t("resultPage.columns.difficultyLevel"),
        questionContent: t("resultPage.columns.questionContent"),
        correctRate: t("resultPage.columns.correctRate"),
        averageScore: t("resultPage.columns.avgScore"),
      }),
    [t, viewMode]
  );

  return (
    <div className="flex flex-col gap-4">
      <ResultTableControls
        viewMode={viewMode}
        sortOrder={sortOrder}
        attemptStatusFilter={attemptStatusFilter}
        searchBy={searchBy}
        searchTerm={searchTerm}
        canExportScores={canExportScores}
        hasActiveFilters={hasActiveFilters}
        onAttemptStatusFilterChange={onAttemptStatusFilterChange}
        onSearchByChange={onSearchByChange}
        onSearchTermChange={onSearchTermChange}
        onSortOrderChange={onSortOrderChange}
        onViewModeChange={onViewModeChange}
        onResetFilters={onResetFilters}
        onExportScores={onExportScores}
      />

      <div
        className="duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-2"
        key={`${viewMode}-${sortOrder}`}
      >
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          key={viewMode}
          rowKey="id"
          hasColumnActions={viewMode === "user"}
          className="border border-other-outlined-border [&_.ant-table-thead>tr>th]:bg-background-body-background [&_.ant-table-thead>tr>th]:text-text-secondary"
          getRowClassName={(item) =>
            item.rowType === "student" && item.isAverage
              ? "bg-warning-background"
              : ""
          }
          renderActions={(item) => {
            if (item.rowType !== "student" || item.isAverage) return null;

            const attemptStatus = item.examAttempt?.status;

            if (attemptStatus === "SUBMITTED") {
              return (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => onViewResult(item.examAttempt?.id || 0)}
                >
                  <Icon name="eye" size={16} className="mr-1" />
                  {t("resultPage.actions.result")}
                </Button>
              );
            }

            if (attemptStatus === "IN_PROGRESS") {
              return (
                <span className="text-caption rounded bg-warning-background px-2 py-1 font-medium text-warning-main">
                  {t("resultPage.status.inProgress")}
                </span>
              );
            }

            return (
              <span className="text-caption font-medium italic text-text-disabled">
                {t("resultPage.status.notJoined")}
              </span>
            );
          }}
          pagination={pagination}
        />
      </div>
    </div>
  );
}
