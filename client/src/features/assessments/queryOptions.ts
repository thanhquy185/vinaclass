import { examService } from "@/features/assessments/api/exam.service";
import { assessmentQueryKeys } from "@/features/assessments/queryKeys";

const EXAM_DETAIL_STALE_TIME = 5 * 60 * 1000;

export function examDetailQueryOptions(examId: number | null, userId?: number) {
  return {
    queryKey: assessmentQueryKeys.exams.detail(examId, userId),
    queryFn: async () => {
      if (examId === null) {
        throw new Error("A valid exam ID is required to load exam details.");
      }

      const response = await examService.getExamById(examId);
      return response.data;
    },
    staleTime: EXAM_DETAIL_STALE_TIME,
  };
}
