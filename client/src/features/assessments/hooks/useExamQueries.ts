import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { examService } from "@/features/assessments/api/exam.service";
import { assessmentQueryKeys } from "@/features/assessments/queryKeys";
import { examDetailQueryOptions } from "@/features/assessments/queryOptions";
import { selectApiData } from "@/shared/query/selectApiData";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { StudentExam } from "@/shared/types";

export const useExams = (enabled = true) => {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: assessmentQueryKeys.exams.list(userId),
    queryFn: examService.getAllExams,
    enabled: enabled && Boolean(userId),
    select: selectApiData,
  });

  return {
    exams: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useExamsByCourseGroupAndStudent = (
  courseGroupId?: number,
  studentId?: number,
) => {
  const query = useEntityQuery({
    queryKey: assessmentQueryKeys.exams.byCourseGroupAndStudent(
      courseGroupId,
      studentId,
    ),
    queryFn: () =>
      examService.getExamByCourseGroupAndStudent(courseGroupId!, studentId!),
    enabled: !!courseGroupId && !!studentId,
    select: (res) => ({
      ...res.data,
      exams: res.data.exams.map((exam) => {
        const responseExam = exam as StudentExam & {
          attempt?: StudentExam["examAttempt"];
        };

        return {
          ...exam,
          examAttempt: responseExam.examAttempt ?? responseExam.attempt ?? null,
        };
      }),
    }),
  });

  return {
    exams: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useStudentExams = (studentId: number | null, enabled = true) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: assessmentQueryKeys.exams.student(studentId, viewerId),
    queryFn: () => examService.getExamsByStudent(studentId!),
    select: (res) => res.data || [],
    enabled: Boolean(studentId && viewerId === studentId && enabled),
  });

  return {
    exams:
      enabled && Boolean(studentId && viewerId === studentId)
        ? query.data || []
        : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useExamDetail = (
  examId: number | null,
  options?: { enabled?: boolean },
) => {
  const userId = useAuthStore((state) => state.user?.id);

  const query = useEntityQuery({
    ...examDetailQueryOptions(examId, userId),
    enabled: !!examId && options?.enabled !== false,
  });

  return {
    exam: options?.enabled === false ? undefined : query.data,
    examConfiguration: query.data?.examConfiguration,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
