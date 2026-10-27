import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { courseGroupService } from "@/features/classrooms/api/course-group.service";
import { courseGroupQueryKeys } from "@/features/classrooms/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export const useCourseGroupMaterialQueries = (courseGroupId: number) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.materials(courseGroupId, userId),
    queryFn: () => courseGroupService.getMaterials(courseGroupId),
    enabled: courseGroupId > 0 && userId !== null,
    select: selectApiData,
  });

  return {
    materials: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
