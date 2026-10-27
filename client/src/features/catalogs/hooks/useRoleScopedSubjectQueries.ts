import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";
import {
  useSubjectQueries,
  useSubjectsByTeacher,
} from "@/features/catalogs/hooks/useSubjectQueries";

export interface UseRoleScopedSubjectQueriesOptions {
  enabled?: boolean;
  includeChapters?: boolean;
}

export function useRoleScopedSubjectQueries(
  options: UseRoleScopedSubjectQueriesOptions = {}
) {
  const { user, role } = useAuthStore();
  const roleKind = getAuthenticatedRoleKind(user, role);
  const isTeacher = roleKind === "TEACHER";
  const isStudent = roleKind === "STUDENT";
  const canLoadRoleSubjects =
    options.enabled !== false && roleKind !== null && !isStudent;
  const canLoadAllSubjects = canLoadRoleSubjects && !isTeacher;
  const subjectQueries = useSubjectQueries({
    enabled: canLoadRoleSubjects,
    includeChapters: options.includeChapters,
    loadSubjects: canLoadAllSubjects,
  });
  const teacherQuery = useSubjectsByTeacher(user?.id, {
    enabled: canLoadRoleSubjects && isTeacher,
  });

  const allSubjects = canLoadAllSubjects ? subjectQueries.subjects : [];
  const teacherSubjects =
    canLoadRoleSubjects && isTeacher ? teacherQuery.subjects : [];
  const isLoadingAllSubjects = canLoadAllSubjects && subjectQueries.isLoading;
  const isFetchingAllSubjects = canLoadAllSubjects && subjectQueries.isFetching;
  const isAllSubjectsError = canLoadAllSubjects && subjectQueries.isError;
  const isLoadingTeacherSubjects =
    canLoadRoleSubjects && isTeacher && teacherQuery.isLoading;
  const isFetchingTeacherSubjects =
    canLoadRoleSubjects && isTeacher && teacherQuery.isFetching;
  const isTeacherSubjectsError =
    canLoadRoleSubjects && isTeacher && teacherQuery.isError;
  const isLoading = isLoadingAllSubjects || isLoadingTeacherSubjects;
  const isFetching = isFetchingAllSubjects || isFetchingTeacherSubjects;
  const isError = isAllSubjectsError || isTeacherSubjectsError;

  const refetch = async () => {
    if (isAllSubjectsError) {
      await subjectQueries.refetch();
      return;
    }
    if (isTeacherSubjectsError) await teacherQuery.refetch();
  };

  return {
    subjects: isTeacher ? teacherSubjects : allSubjects,
    allSubjects,
    teacherSubjects,
    isLoading,
    isFetching,
    isError,
    refetch,
    isLoadingAllSubjects,
    isFetchingAllSubjects,
    isAllSubjectsError,
    refetchAllSubjects: subjectQueries.refetch,
    isLoadingTeacherSubjects,
    isFetchingTeacherSubjects,
    isTeacherSubjectsError,
    refetchTeacherSubjects: teacherQuery.refetch,
    subjectsWithChapters: canLoadRoleSubjects
      ? subjectQueries.subjectsWithChapters
      : [],
    isLoadingChapters: canLoadRoleSubjects
      ? subjectQueries.isLoadingChapters
      : false,
    isFetchingChapters: canLoadRoleSubjects
      ? subjectQueries.isFetchingChapters
      : false,
    isErrorChapters: canLoadRoleSubjects
      ? subjectQueries.isErrorChapters
      : false,
    refetchChapters: subjectQueries.refetchChapters,
  };
}
