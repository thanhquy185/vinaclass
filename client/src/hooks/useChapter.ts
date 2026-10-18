import { chapterService } from "@/services/api/chapter.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useChaptersBySubject = (subjectId?: number) => {
  const query = useQuery({
    queryKey: ["chapters", "subject", subjectId],
    queryFn: () => chapterService.getChaptersBySubject(subjectId),
    select: (res) => res.data,
    enabled: !!subjectId,
  });

  return {
    chapters: query.data || [],
    isLoading: query.isLoading,
  };
};

export const useUpdateSubjectChapters = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: chapterService.updateSubjectChapters,

    onSuccess: (data) => {
      const subjectId = data?.data.id;
      queryClient.invalidateQueries({
        queryKey: ["chapters", "subject", subjectId],
      });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  return {
    updateSubjectChapters: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};
