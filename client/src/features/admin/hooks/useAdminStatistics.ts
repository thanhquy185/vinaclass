import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { dashboardService } from "@/features/admin/api/dashboard.service";
import { adminQueryKeys } from "@/features/admin/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { StatisticsPeriodType } from "@/features/admin/utils/statisticsPeriod";

export const useAdminStatistics = (
  report: string,
  periodType: StatisticsPeriodType,
  periodValue: string,
  periodStartDate: string,
  periodEndDate: string,
  isPeriodValid: boolean
) => {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: adminQueryKeys.statistics(
      userId,
      report,
      periodType,
      periodValue,
      periodStartDate,
      periodEndDate
    ),
    queryFn: () =>
      dashboardService.getAdminStatistics(
        report,
        periodType,
        periodValue,
        periodStartDate,
        periodEndDate
      ),
    select: selectApiData,
    enabled: Boolean(userId && report && isPeriodValid),
  });

  return {
    statistics: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
