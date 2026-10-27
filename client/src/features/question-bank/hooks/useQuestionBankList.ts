import { useState } from "react";
import type { QuestionStatus } from "@/shared/types";
import type {
  QuestionSearchCriterion,
  QuestionSortOrder,
} from "@/features/question-bank/types/questionBank";

const QUESTIONS_PER_PAGE = 10;

export function useQuestionBankList() {
  const [selectedTab, setSelectedTab] = useState<QuestionStatus>("public");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState<QuestionSearchCriterion>("content");
  const [sortOrder, setSortOrder] = useState<QuestionSortOrder>("none");
  const [filterSubjectId, setFilterSubjectId] = useState(-1);
  const [filterChapterId, setFilterChapterId] = useState(-1);
  const [filterDifficultyId, setFilterDifficultyId] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    filterSubjectId !== -1 ||
    filterChapterId !== -1 ||
    filterDifficultyId !== -1 ||
    sortOrder !== "none";

  const handleTabSelect = (status: QuestionStatus) => {
    setSelectedTab(status);
    setCurrentPage(1);
  };

  const handleSubjectChange = (subjectId: number) => {
    setFilterSubjectId(subjectId);
    setFilterChapterId(-1);
    setCurrentPage(1);
  };

  const handleChapterChange = (chapterId: number) => {
    setFilterChapterId(chapterId);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (difficultyId: number) => {
    setFilterDifficultyId(difficultyId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSearchByChange = (criterion: QuestionSearchCriterion) => {
    setSearchBy(criterion);
    setCurrentPage(1);
  };

  const handleSortChange = (order: QuestionSortOrder) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSearchBy("content");
    setSortOrder("none");
    setFilterSubjectId(-1);
    setFilterChapterId(-1);
    setFilterDifficultyId(-1);
    setCurrentPage(1);
  };

  return {
    selectedTab,
    searchQuery,
    searchBy,
    sortOrder,
    filterSubjectId,
    filterChapterId,
    filterDifficultyId,
    currentPage,
    pageSize: QUESTIONS_PER_PAGE,
    hasActiveFilters,
    setCurrentPage,
    handleTabSelect,
    handleSubjectChange,
    handleChapterChange,
    handleDifficultyChange,
    handleSearchChange,
    handleSearchByChange,
    handleSortChange,
    resetFilters,
  };
}
