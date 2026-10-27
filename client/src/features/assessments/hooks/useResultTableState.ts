import { useCallback, useMemo, useState } from "react";
import { useTablePagination } from "@/shared/hooks/useTablePagination";
import type {
  Difficulty,
  ExamReviewResponse,
  Question,
  User,
} from "@/shared/types";
import {
  buildResultTableData,
  type AttemptStatusFilter,
  type ResultSortOrder,
  type ResultSearchCriterion,
  type ResultViewMode,
  type StudentResultRow,
} from "@/features/assessments/utils/buildResultTableData";
import { filterResultTableData } from "@/features/assessments/utils/filterResultTableData";

const RESULT_PAGE_SIZE = 20;

interface UseResultTableStateOptions {
  students: User[];
  examQuestions: Question[];
  examAttempts: ExamReviewResponse["examAttempts"];
  difficulties: Difficulty[];
  averageLabel: string;
}

export function useResultTableState({
  students,
  examQuestions,
  examAttempts,
  difficulties,
  averageLabel,
}: UseResultTableStateOptions) {
  const [selectedTab, setSelectedTab] = useState<"stat" | "classScore">(
    "classScore",
  );
  const [viewMode, setViewMode] = useState<ResultViewMode>("user");
  const [sortOrder, setSortOrder] = useState<ResultSortOrder>(null);
  const [searchBy, setSearchBy] =
    useState<ResultSearchCriterion>("studentId");
  const [searchTerm, setSearchTerm] = useState("");
  const [attemptStatusFilter, setAttemptStatusFilter] =
    useState<AttemptStatusFilter>("all");

  const tableData = useMemo(
    () =>
      buildResultTableData({
        viewMode,
        sortOrder,
        students,
        examQuestions,
        examAttempts,
        difficulties,
        averageLabel,
      }),
    [
      viewMode,
      sortOrder,
      students,
      examQuestions,
      examAttempts,
      difficulties,
      averageLabel,
    ],
  );

  const studentRows = useMemo(() => {
    if (viewMode !== "user") {
      return [] as StudentResultRow[];
    }

    return tableData.filter(
      (row): row is StudentResultRow =>
        row.rowType === "student" && !row.isAverage,
    );
  }, [tableData, viewMode]);

  const visibleTableData = useMemo(
    () =>
      filterResultTableData({
        tableData,
        studentRows,
        viewMode,
        searchBy,
        searchTerm,
        attemptStatusFilter,
      }),
    [
      tableData,
      studentRows,
      viewMode,
      searchBy,
      searchTerm,
      attemptStatusFilter,
    ],
  );
  const { pagination, setCurrentPage } = useTablePagination(
    visibleTableData.length,
    RESULT_PAGE_SIZE,
  );

  const resetPage = useCallback(() => setCurrentPage(1), [setCurrentPage]);
  const handleTabChange = useCallback(
    (tab: "stat" | "classScore") => {
      setSelectedTab(tab);
      resetPage();
    },
    [resetPage],
  );
  const handleAttemptStatusFilterChange = useCallback(
    (filter: AttemptStatusFilter) => {
      setAttemptStatusFilter(filter);
      resetPage();
    },
    [resetPage],
  );
  const handleSearchTermChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      resetPage();
    },
    [resetPage],
  );
  const handleSearchByChange = useCallback(
    (criterion: ResultSearchCriterion) => {
      setSearchBy(criterion);
      resetPage();
    },
    [resetPage],
  );
  const handleSortOrderChange = useCallback(
    (nextSortOrder: ResultSortOrder) => {
      setSortOrder(nextSortOrder);
      resetPage();
    },
    [resetPage],
  );
  const handleViewModeChange = useCallback(
    (nextViewMode: ResultViewMode) => {
      setViewMode(nextViewMode);
      resetPage();
    },
    [resetPage],
  );
  const handleResetFilters = useCallback(() => {
    setViewMode("user");
    setSortOrder(null);
    setSearchBy("studentId");
    setSearchTerm("");
    setAttemptStatusFilter("all");
    resetPage();
  }, [resetPage]);
  const hasActiveFilters =
    viewMode !== "user" ||
    sortOrder !== null ||
    searchBy !== "studentId" ||
    searchTerm.trim().length > 0 ||
    attemptStatusFilter !== "all";

  return {
    selectedTab,
    viewMode,
    sortOrder,
    searchBy,
    searchTerm,
    attemptStatusFilter,
    studentRows,
    visibleTableData,
    pagination,
    handleTabChange,
    handleAttemptStatusFilterChange,
    handleSearchTermChange,
    handleSortOrderChange,
    handleSearchByChange,
    handleViewModeChange,
    handleResetFilters,
    hasActiveFilters,
  };
}
