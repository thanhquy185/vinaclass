import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { questionService } from "@/features/question-bank/api/question.service";
import { questionQueryKeys } from "@/features/question-bank/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import type { QuestionBankFilters } from "@/features/question-bank/types/questionBank";

interface QueryOptions {
  enabled?: boolean;
}

export const useQuestionBank = (
  filters: QuestionBankFilters,
  options: QueryOptions = {}
) => {
  const query = useEntityQuery({
    queryKey: questionQueryKeys.bank(filters),
    queryFn: () => questionService.getQuestionBank(filters),
    enabled: options.enabled !== false,
    select: selectApiData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useQuestions = () => {
  const query = useEntityQuery({
    queryKey: questionQueryKeys.root,
    queryFn: questionService.getAllQuestions,
    select: selectApiData,
  });

  return {
    questions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useQuestionsPrivate = (id?: number) => {
  const query = useEntityQuery({
    queryKey: questionQueryKeys.private(id),
    queryFn: () => questionService.getQuestionsWithPrivate(id!),
    enabled: !!id,
    select: selectApiData,
  });

  return {
    privateQuestions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useQuestionsPublic = (options: QueryOptions = {}) => {
  const query = useEntityQuery({
    queryKey: questionQueryKeys.public,
    queryFn: () => questionService.getPublicQuestions(),
    enabled: options.enabled !== false,
    select: selectApiData,
  });

  return {
    publicQuestions: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useQuestionsOfUser = (
  userId?: number,
  options: QueryOptions = {}
) => {
  const query = useEntityQuery({
    queryKey: questionQueryKeys.byTeacher(userId),
    queryFn: () => questionService.getQuestionsByTeacher(userId!),
    enabled: !!userId && options.enabled !== false,
    select: selectApiData,
  });

  return {
    personalQuestions: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// Loads a question for a detail page or modal.
export const useQuestionDetail = (id: number | undefined) => {
  const query = useEntityQuery({
    queryKey: questionQueryKeys.detail(id),
    queryFn: () => questionService.getQuestionById(id!),
    enabled: !!id,
    select: selectApiData,
    // Keep the previous result visible while the next detail is loading.
    placeholderData: (previousData) => previousData,
  });

  return {
    question: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
};
