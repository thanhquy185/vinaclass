import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examAttemptService } from "@/services/api/exam-attempt.service";
import { useExamStore } from "@/stores/useExamStore";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { examService as examDefinitionService } from "@/services/api/exam.service";

type AnswerInput = {
  questionId: number;
  answerId: number;
};

export const useExamActions = (
  courseGroupId?: number,
  examId?: number
) => {
  const queryClient = useQueryClient();
  const {
    initExam,
    updateAnswer: updateStoreAnswer,
    setFinalResult,
  } = useExamStore();
  const { updateTestData } = useDeThiStore();

  // Hook 1: Bắt đầu bài thi
  const startExamMutation = useMutation({
    mutationFn: async ({
      studentId,
      examId,
    }: {
      studentId: number;
      examId: number;
    }) => {
      // Lấy chi tiết đề thi trước (để có câu hỏi)
      const deThiDetail = await queryClient.fetchQuery({
        queryKey: ["exams", "detail", examId],
        queryFn: async () => {
          console.log("Fetching detail...");
          const res = await examDefinitionService.getExamById(examId);
          return res.data; // Phải return dữ liệu ở đây
        },
      });

      // Gọi API tạo bản ghi bài làm
      const startRes = await examAttemptService.startExam({ studentId, examId });

      return { examDetail: deThiDetail, examAttempt: startRes.data };
    },
    onSuccess: (data) => {
      // Cập nhật vào các Store
      console.log(data.examAttempt);
      updateTestData({ ...data.examDetail });
      initExam(data.examAttempt, "STUDENT");
    },
  });

  // Hook 2: Cập nhật đáp án (với logic debounce nên đặt ở đây hoặc component)
  const updateAnswerMutation = useMutation({
    mutationFn: ({
      examAttemptId,
      answers,
    }: {
      examAttemptId: number;
      answers: AnswerInput[];
    }) => examAttemptService.updateAnswers(examAttemptId, answers),
    onMutate: async ({ answers }) => {
      // Optimistic Update: Cập nhật store local ngay lập tức trước khi API phản hồi
      const { questionId, answerId } = answers[0];
      updateStoreAnswer(questionId, answerId);
    },
  });

  // Hook 3: Nộp bài
  const submitExamMutation = useMutation({
    mutationFn: ({
      examAttemptId,
      answers,
    }: {
      examAttemptId: number;
      answers: AnswerInput[];
    }) => examAttemptService.submitExam(examAttemptId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exams", "student"],
      });

      queryClient.invalidateQueries({
        queryKey: ["exams"],
      });

      // 3. Làm mới danh sách bài làm (nếu có bảng lịch sử bài làm)
      queryClient.invalidateQueries({
        queryKey: ["exam-attempts"],
      });
    },
  });

  // Hook 4: Cập nhật vi phạm
  const updateViolationMutation = useMutation({
    mutationFn: ({
      examAttemptId,
      count,
    }: {
      examAttemptId: number;
      count: number;
    }) => examAttemptService.updateAttemptLog(examAttemptId, { tabSwitchCount: count }),
    onSuccess: () => {
      console.log("Đã đồng bộ số lần vi phạm lên server");
    },
  });

  /**
   * Hook 5: Xem lại kết quả (Review)
   * Dùng khi user truy cập thẳng vào link kết quả hoặc sau khi nộp bài mà cần fetch lại dữ liệu mới nhất
   */
  const reviewExamMutation = useMutation({
    mutationFn: (examAttemptId: number) =>
      examAttemptService.getReviewResult(examAttemptId),
    onSuccess: (res) => {
      // Đồng bộ kết quả (bao gồm cả trường hợp ẩn chi tiết câu hỏi) vào Store
      setFinalResult(res.data);
      console.log(res.data);
    },
  });

  const query = useQuery({
    queryKey: ["exam-attempts"],
    queryFn: examAttemptService.getAllAttempts,
    select: (res) => res.data,
  });

  const examResultsQuery = useQuery({
    queryKey: ["exam-attempts", "group", courseGroupId, examId],
    queryFn: () =>
      examAttemptService.getAttemptsByCourseGroupAndExam(
        courseGroupId!,
        examId!
      ),
    enabled: !!courseGroupId && !!examId,
    select: (res) => res.data,
  });

  return {
    examAttempts: query.data,
    examResults: examResultsQuery.data,
    startExam: startExamMutation.mutateAsync,
    isStarting: startExamMutation.isPending,
    updateAnswer: updateAnswerMutation.mutate,
    submitExam: submitExamMutation.mutateAsync,
    isSubmitting: submitExamMutation.isPending,
    updateViolation: updateViolationMutation.mutate,
    // Expose thêm action review
    reviewExam: reviewExamMutation.mutateAsync,
  };
};
