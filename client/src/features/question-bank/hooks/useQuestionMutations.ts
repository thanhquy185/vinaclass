import { questionService } from "@/features/question-bank/api/question.service";
import { questionQueryKeys } from "@/features/question-bank/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";

function useQuestionMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  return useInvalidatingMutation(mutationFn, () => [questionQueryKeys.root]);
}

// Creates a question.
export const useCreateQuestion = () => {
  const mutation = useQuestionMutation(questionService.createQuestion);

  return {
    createQuestion: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

// Copies a public question into the user's private bank.
export const useCopyQuestionToPrivate = () => {
  const mutation = useQuestionMutation(questionService.copyQuestionFromPublic);

  return {
    copyQuestion: mutation.mutateAsync,
    isCopying: mutation.isPending,
    isCopyError: mutation.isError,
    isCopySuccess: mutation.isSuccess,
  };
};

// Updates a question's publication status.
export const useUpdateQuestionStatus = () => {
  const mutation = useQuestionMutation(questionService.updateQuestionStatus);

  const publicQuestionAsync = (id: number) =>
    mutation.mutateAsync({
      questionId: id,
      data: { status: "public" },
    });

  const archiveQuestionAsync = (id: number) =>
    mutation.mutateAsync({
      questionId: id,
      data: { status: "archive" },
    });

  const restoreQuestionAsync = (id: number) =>
    mutation.mutateAsync({
      questionId: id,
      data: { status: "private" },
    });

  const moveToPrivateAsync = (id: number) =>
    mutation.mutateAsync({
      questionId: id,
      data: { status: "private" },
    });

  return {
    publicQuestionAsync,
    archiveQuestionAsync,
    restoreQuestionAsync,
    moveToPrivateAsync,
    isUpdatingStatus: mutation.isPending,
    isUpdateStatusError: mutation.isError,
    isUpdateStatusSuccess: mutation.isSuccess,
  };
};

// Updates a question.
export const useUpdateQuestion = () => {
  const mutation = useQuestionMutation(questionService.updateQuestion);

  return {
    updateQuestion: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};

// Deletes a question.
export const useDeleteQuestion = () => {
  const mutation = useQuestionMutation(questionService.deleteQuestion);

  return {
    deleteQuestion: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};
