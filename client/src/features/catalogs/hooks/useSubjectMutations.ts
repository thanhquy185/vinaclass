import { subjectService } from "@/features/catalogs/api/subject.service";
import { catalogQueryKeys } from "@/features/catalogs/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import type { SubjectRequest, SubjectUpdateRequest } from "@/shared/types";

export const useSubjectMutations = () => {
  const subjectQueryKeys = () => [catalogQueryKeys.subjects.root];
  const createMutation = useInvalidatingMutation(
    (data: SubjectRequest) => subjectService.createSubject(data),
    subjectQueryKeys,
    { waitForInvalidation: true },
  );

  const updateMutation = useInvalidatingMutation(
    ({ subjectId, data }: { subjectId: number; data: SubjectUpdateRequest }) =>
      subjectService.updateSubject(subjectId, data),
    subjectQueryKeys,
    { waitForInvalidation: true },
  );

  const deleteMutation = useInvalidatingMutation(
    subjectService.deleteSubject,
    subjectQueryKeys,
    { waitForInvalidation: true },
  );

  return {
    createSubject: createMutation.mutateAsync,
    updateSubject: updateMutation.mutateAsync,
    deleteSubject: deleteMutation.mutateAsync,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};
