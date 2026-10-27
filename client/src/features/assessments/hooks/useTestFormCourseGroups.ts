import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { subjectService } from "@/features/catalogs/api/subject.service";
import { catalogQueryKeys } from "@/features/catalogs/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";

interface UseTestFormCourseGroupsOptions {
  subjectId?: number;
  enabled: boolean;
}

export function useTestFormCourseGroups({
  subjectId,
  enabled,
}: UseTestFormCourseGroupsOptions) {
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const query = useEntityQuery({
    queryKey: catalogQueryKeys.subjects.courseGroupsBySubject(
      subjectId,
      user?.id,
      roleCode,
    ),
    queryFn: () => subjectService.getCourseGroupsForExam(subjectId!),
    enabled: Boolean(subjectId && enabled),
    select: selectApiData,
  });

  const courseGroups = query.data ?? [];

  return {
    courseGroups,
    groupOptions: courseGroups.map((group) => ({
      label: group.groupName,
      value: group.id,
    })),
    isLoadingCourseGroups: query.isLoading,
    isCourseGroupsError: query.isError,
    refetchCourseGroups: query.refetch,
  };
}
