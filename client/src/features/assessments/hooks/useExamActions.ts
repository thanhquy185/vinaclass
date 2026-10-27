import { useExamAttemptMutations } from "@/features/assessments/hooks/useExamAttemptMutations";
import { useExamAttemptQueries } from "@/features/assessments/hooks/useExamAttemptQueries";

export const useExamActions = (
  courseGroupId?: number,
  examId?: number,
  options: { canViewGroupResults?: boolean } = {},
) => {
  const queries = useExamAttemptQueries(courseGroupId, examId, options);
  const mutations = useExamAttemptMutations();
  return {
    ...queries,
    ...mutations,
  };
};
