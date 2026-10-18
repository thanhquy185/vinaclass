import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { difficultyService } from "@/services/api/difficulty.service";

export const useDifficulties = () => {
  const query = useQuery({
    queryKey: ["difficulties"],
    queryFn: difficultyService.getAllDifficulties,
    select: (res) => res.data,
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: difficultyService.createDifficulty,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["difficulties"] }),
  });

  const updateMutation = useMutation({
    mutationFn: difficultyService.updateDifficulty,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["difficulties"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: difficultyService.deleteDifficulty,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["difficulties"] }),
  });

  return {
    difficulties: query.data || [],
    isLoading: query.isLoading,
    createDifficulty: createMutation.mutateAsync,
    updateDifficulty: updateMutation.mutateAsync,
    deleteDifficulty: deleteMutation.mutateAsync,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};
