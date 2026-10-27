import { difficultyService } from "@/features/catalogs/api/difficulty.service";
import { catalogQueryKeys } from "@/features/catalogs/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";

export const useDifficultyMutations = () => {
  const createMutation = useInvalidatingMutation(
    difficultyService.createDifficulty,
    () => [catalogQueryKeys.difficulties.all],
    { waitForInvalidation: true },
  );

  const updateMutation = useInvalidatingMutation(
    difficultyService.updateDifficulty,
    () => [catalogQueryKeys.difficulties.all],
    { waitForInvalidation: true },
  );

  const deleteMutation = useInvalidatingMutation(
    difficultyService.deleteDifficulty,
    () => [catalogQueryKeys.difficulties.all],
    { waitForInvalidation: true },
  );

  return {
    createDifficulty: createMutation.mutateAsync,
    updateDifficulty: updateMutation.mutateAsync,
    deleteDifficulty: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};
