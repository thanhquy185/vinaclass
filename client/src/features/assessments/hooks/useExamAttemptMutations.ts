import { useQueryClient } from "@tanstack/react-query";
import { useEntityMutation } from "@/hooks/shared/useEntityMutation";
import { examAttemptService } from "@/features/assessments/api/exam-attempt.service";
import { assessmentQueryKeys } from "@/features/assessments/queryKeys";
import { examDetailQueryOptions } from "@/features/assessments/queryOptions";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";

type AnswerInput = {
  questionId: number;
  answerId: number;
};

type SubmittedAnswerInput = {
  questionId: number;
  answerId: number | null;
};

export const useExamAttemptMutations = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const initExam = useExamSessionStore((state) => state.initExam);
  const updateStoreAnswer = useExamSessionStore((state) => state.updateAnswer);
  const setFinalResult = useExamSessionStore((state) => state.setFinalResult);
  const updateTestData = useExamDraftStore((state) => state.updateTestData);

  const startExamMutation = useEntityMutation({
    mutationFn: async ({
      studentId,
      examId,
    }: {
      studentId: number;
      examId: number;
    }) => {
      const examDetail = await queryClient.fetchQuery(
        examDetailQueryOptions(examId, userId)
      );

      const startRes = await examAttemptService.startExam({
        studentId,
        examId,
      });

      return { examDetail, examAttempt: startRes.data };
    },
    onSuccess: (data) => {
      updateTestData({ ...data.examDetail });
      initExam(data.examAttempt, "STUDENT");
    },
  });

  const updateAnswerMutation = useEntityMutation({
    mutationFn: ({
      examAttemptId,
      answers,
    }: {
      examAttemptId: number;
      answers: AnswerInput[];
    }) => examAttemptService.updateAnswers(examAttemptId, answers),
    onMutate: async ({ answers }) => {
      const { questionId, answerId } = answers[0];
      updateStoreAnswer(questionId, answerId);
    },
  });

  const submitExamMutation = useInvalidatingMutation(
    ({
      examAttemptId,
      answers,
    }: {
      examAttemptId: number;
      answers: SubmittedAnswerInput[];
    }) => examAttemptService.submitExam(examAttemptId, answers),
    () => [
      assessmentQueryKeys.exams.studentRoot,
      assessmentQueryKeys.exams.all,
      assessmentQueryKeys.attempts.all,
    ]
  );

  const updateViolationMutation = useEntityMutation({
    mutationFn: ({
      examAttemptId,
      count,
    }: {
      examAttemptId: number;
      count: number;
    }) =>
      examAttemptService.updateAttemptLog(examAttemptId, {
        tabSwitchCount: count,
      }),
  });

  const reviewExamMutation = useEntityMutation({
    mutationFn: (examAttemptId: number) =>
      examAttemptService.getReviewResult(examAttemptId),
    onSuccess: (res) => {
      setFinalResult(res.data);
    },
  });

  return {
    startExam: startExamMutation.mutateAsync,
    isStarting: startExamMutation.isPending,
    updateAnswer: updateAnswerMutation.mutate,
    submitExam: submitExamMutation.mutateAsync,
    isSubmitting: submitExamMutation.isPending,
    updateViolation: updateViolationMutation.mutate,
    reviewExam: reviewExamMutation.mutateAsync,
  };
};
