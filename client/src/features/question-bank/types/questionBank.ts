import type { Question } from "@/shared/types";

export type QuestionSortOrder = "none" | "asc" | "desc";
export type QuestionSearchCriterion = "content" | "answer";

export interface QuestionBankFilters {
  status: "public" | "private" | "archive";
  keyword: string;
  searchBy: QuestionSearchCriterion;
  subjectId: number;
  chapterId: number;
  difficultyId: number;
  sortOrder: QuestionSortOrder;
  page: number;
  perPage: number;
}

export interface QuestionBankPageData {
  questions: Question[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    lastPage: number;
  };
  stats: {
    total: number;
    public: number;
    private: number;
    archive: number;
  };
}
