import { useQueryClient } from "@tanstack/react-query";
import { examService } from "@/features/assessments/api/exam.service";
import { assessmentQueryKeys } from "@/features/assessments/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import type { CreateExamPayload } from "@/shared/types";

/** Creates an exam and refreshes the exam list. */
export const useCreateExam = () =>
  useInvalidatingMutation(
    (payload: CreateExamPayload) => examService.createExam(payload),
    () => [assessmentQueryKeys.exams.all]
  );

/** Updates an exam and refreshes its list and detail queries. */
export const useUpdateExam = () =>
  useInvalidatingMutation(
    ({ id, payload }: { id: number; payload: CreateExamPayload }) =>
      examService.updateExam(id, payload),
    (_, variables) => [
      assessmentQueryKeys.exams.all,
      assessmentQueryKeys.exams.detailPrefix(variables.id),
    ]
  );

/** Deletes an exam and clears the matching detail query. */
export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useInvalidatingMutation(
    (id: number) => examService.deleteExam(id),
    () => [assessmentQueryKeys.exams.all],
    {
      onSuccess: (_response, id) => {
        queryClient.removeQueries({
          queryKey: assessmentQueryKeys.exams.detailPrefix(id),
        });
      },
    }
  );
};
