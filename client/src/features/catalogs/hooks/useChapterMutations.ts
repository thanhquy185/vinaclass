import { chapterService } from "@/features/catalogs/api/chapter.service";
import { catalogQueryKeys } from "@/features/catalogs/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";

export const useUpdateSubjectChapters = () => {
  const mutation = useInvalidatingMutation(
    chapterService.updateSubjectChapters,
    (response) => [
      catalogQueryKeys.chapters.bySubject(response?.data.id),
      catalogQueryKeys.subjects.root,
      catalogQueryKeys.subjects.withChapters(),
    ],
  );

  return {
    updateSubjectChapters: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isUpdateError: mutation.isError,
    isUpdateSuccess: mutation.isSuccess,
  };
};
