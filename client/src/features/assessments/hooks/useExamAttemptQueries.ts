import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { examAttemptService } from "@/features/assessments/api/exam-attempt.service";
import { assessmentQueryKeys } from "@/features/assessments/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import {
  getAuthenticatedRoleKind,
  getAuthenticatedUserRoleCode,
} from "@/shared/utils/role";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";

export const useExamAttemptQueries = (
  courseGroupId?: number,
  examId?: number,
  options: { canViewGroupResults?: boolean } = {}
) => {
  const { user, role } = useAuthStore();
  const { hasAction: hasExamAction, isLoading: isPermissionLoading } =
    useFunctionActions("de_thi");

  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const roleKind = getAuthenticatedRoleKind(user, role);
  const isStudent = roleCode === "STUDENT";
  const isAdmin = roleCode === "ADMIN";
  const isTeacher = roleCode === "TEACHER";
  const isCustom = roleKind === "CUSTOM";
  const canViewExams = hasExamAction("view") && !isPermissionLoading;
  const canFetchExamAttempts = Boolean(
    isAdmin || (isStudent && user?.id && canViewExams)
  );
  const canFetchExamResults = Boolean(
    courseGroupId &&
    examId &&
    (isAdmin ||
      (isTeacher && canViewExams && options.canViewGroupResults === true) ||
      (isCustom && canViewExams && options.canViewGroupResults === true))
  );

  const query = useEntityQuery({
    queryKey: assessmentQueryKeys.attempts.list(
      isStudent ? "student" : "all",
      user?.id
    ),
    queryFn: async () => {
      if (isStudent && user) {
        const response = await examAttemptService.getAttemptsByStudent(user.id);
        return response.data.examAttempts;
      }

      const response = await examAttemptService.getAllAttempts();
      return response.data;
    },
    enabled: canFetchExamAttempts,
  });

  const examResultsQuery = useEntityQuery({
    queryKey: assessmentQueryKeys.attempts.group(
      courseGroupId,
      examId,
      user?.id
    ),
    queryFn: () =>
      examAttemptService.getAttemptsByCourseGroupAndExam(
        courseGroupId!,
        examId!
      ),
    enabled: canFetchExamResults,
    select: selectApiData,
  });

  return {
    examAttempts: canFetchExamAttempts ? query.data : undefined,
    isLoadingExamAttempts: query.isLoading,
    isFetchingExamAttempts: query.isFetching,
    isErrorExamAttempts: query.isError,
    refetchExamAttempts: query.refetch,
    examResults: canFetchExamResults ? examResultsQuery.data : undefined,
    isLoadingExamResults: examResultsQuery.isLoading,
    isFetchingExamResults: examResultsQuery.isFetching,
    isErrorExamResults: examResultsQuery.isError,
    refetchExamResults: examResultsQuery.refetch,
  };
};
