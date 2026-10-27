import { dashboardService } from "@/features/admin/api/dashboard.service";
import { adminQueryKeys } from "@/features/admin/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useEntityQuery } from "@/hooks/shared/useEntityQuery";

export const useAdminDashboardSummary = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: adminQueryKeys.dashboardSummary(userId),
    queryFn: dashboardService.getAdminSummary,
    select: selectApiData,
    enabled: !!userId,
    refetchInterval: 60_000,
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
