import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { subjectService } from "@/features/catalogs/api/subject.service";
import { catalogQueryKeys } from "@/features/catalogs/queryKeys";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import { selectApiData } from "@/shared/query/selectApiData";

export interface UseSubjectOptions {
  includeChapters?: boolean;
  enabled?: boolean;
  loadSubjects?: boolean;
}

export const useSubjectQueries = (options: UseSubjectOptions = {}) => {
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const shouldLoadSubjects =
    options.enabled !== false && options.loadSubjects !== false;

  const query = useEntityQuery({
    queryKey: catalogQueryKeys.subjects.list(user?.id, roleCode),
    queryFn: subjectService.getAllSubjects,
    enabled: shouldLoadSubjects,
    select: selectApiData,
  });

  const queryWithChapters = useEntityQuery({
    queryKey: catalogQueryKeys.subjects.withChapters(user?.id, roleCode),
    queryFn: subjectService.getSubjectsWithChapters,
    enabled: options.includeChapters === true && options.enabled !== false,
    select: selectApiData,
  });

  return {
    subjects: query.data || [],
    subjectsWithChapters: queryWithChapters.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    isLoadingChapters: queryWithChapters.isLoading,
    isFetchingChapters: queryWithChapters.isFetching,
    isErrorChapters: queryWithChapters.isError,
    refetchChapters: queryWithChapters.refetch,
  };
};

export const useSubjectsByTeacher = (
  teacherId?: number,
  options: { enabled?: boolean } = {}
) => {
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const isAllowedTarget =
    roleCode === "ADMIN"
      ? teacherId !== user?.id
      : roleCode === "TEACHER" && teacherId === user?.id;

  const query = useEntityQuery({
    queryKey: catalogQueryKeys.subjects.byTeacher(
      teacherId,
      user?.id,
      roleCode
    ),
    queryFn: () => subjectService.getSubjectsByTeacher(teacherId!),
    enabled: !!teacherId && isAllowedTarget && options.enabled !== false,
    select: selectApiData,
  });

  return {
    subjects: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
