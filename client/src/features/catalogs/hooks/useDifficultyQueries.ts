import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { difficultyService } from "@/features/catalogs/api/difficulty.service";
import { catalogQueryKeys } from "@/features/catalogs/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";

export interface UseDifficultiesOptions {
  enabled?: boolean;
}

export const useDifficultyQueries = (options: UseDifficultiesOptions = {}) => {
  const query = useEntityQuery({
    queryKey: catalogQueryKeys.difficulties.all,
    queryFn: difficultyService.getAllDifficulties,
    enabled: options.enabled !== false,
    select: selectApiData,
  });

  return {
    difficulties: options.enabled === false ? [] : query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
