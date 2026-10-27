import { useStudentExams } from "@/features/assessments/hooks/useExamQueries";
import { useExamActions } from "@/features/assessments/hooks/useExamActions";
import { useStudentExamActions } from "@/features/assessments/hooks/useStudentExamActions";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";

export function useExamPageController() {
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const isStudent = roleCode === "STUDENT";
  const permission = useFunctionActions("de_thi");
  const canViewExams = isStudent && permission.hasAction("view");

  const examQuery = useStudentExams(
    isStudent ? (user?.id ?? null) : null,
    canViewExams && !permission.isLoading
  );
  const examActions = useExamActions();
  const { handleStartExam } = useStudentExamActions(canViewExams);

  const handleRetryExamData = () =>
    Promise.all([examQuery.refetch(), examActions.refetchExamAttempts()]);

  return {
    permission,
    canViewExams,
    examQuery,
    examActions,
    handleRetryExamData,
    handleStartExam,
  };
}
