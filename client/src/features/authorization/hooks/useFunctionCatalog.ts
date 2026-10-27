import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { authorizationService } from "@/features/authorization/api/authorization.service";
import { authorizationQueryKeys } from "@/features/authorization/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";

export function useFunctionCatalog(enabled = true) {
  const query = useEntityQuery({
    queryKey: authorizationQueryKeys.functionCatalog,
    queryFn: authorizationService.getFunctionCatalog,
    enabled,
    select: selectApiData,
  });

  return {
    functions: enabled ? (query.data ?? []) : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
