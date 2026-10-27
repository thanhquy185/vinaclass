import type { MutationFunction, QueryKey } from "@tanstack/react-query";
import {
  useEntityMutation,
  type EntityMutationNotifications,
} from "@/hooks/shared/useEntityMutation";

type QueryKeyResolver<TData, TVariables> = (
  data: TData,
  variables: TVariables
) => readonly QueryKey[];

interface UseInvalidatingMutationOptions<TData, TVariables> {
  waitForInvalidation?: boolean;
  onSuccessBeforeInvalidation?: (data: TData, variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: unknown, variables: TVariables) => void | Promise<void>;
  notifications?: EntityMutationNotifications<TData, TVariables, unknown>;
}

export function useInvalidatingMutation<TData, TVariables>(
  mutationFn: MutationFunction<TData, TVariables>,
  getQueryKeys: QueryKeyResolver<TData, TVariables>,
  options: UseInvalidatingMutationOptions<TData, TVariables> = {}
) {
  return useEntityMutation({
    mutationFn,
    invalidateKeys: (data, variables) => getQueryKeys(data, variables),
    waitForInvalidation: options.waitForInvalidation,
    notifications: options.notifications,
    onSuccessBeforeInvalidation: options.onSuccessBeforeInvalidation,
    onSuccess: (data, variables) => {
      return options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => options.onError?.(error, variables),
  });
}
