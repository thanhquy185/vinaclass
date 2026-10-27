import type { QuestionBankFilters } from "@/features/question-bank/types/questionBank";

export const questionQueryKeys = {
  root: ["questions"] as const,
  bank: (filters: QuestionBankFilters) =>
    ["questions", "bank", filters] as const,
  private: (userId?: number) => ["questions", "private", userId] as const,
  public: ["questions", "public"] as const,
  byTeacher: (userId?: number) => ["questions", "teacher", userId] as const,
  detail: (questionId?: number) => ["questions", questionId] as const,
};
