import { App } from "antd";
import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { openNotification } from "@/utils/showNotificationUtil";

type QueryErrorNotification<TError> = string | ((error: TError) => string);

export type UseEntityQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  errorNotification?: QueryErrorNotification<TError>;
};

/** Shared TanStack Query wrapper with optional Ant Design error notifications. */
export function useEntityQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseEntityQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const { notification } = App.useApp();
  const { errorNotification, ...queryOptions } = options;
  const query = useQuery(queryOptions);
  const notifiedError = useRef<TError | null>(null);

  useEffect(() => {
    if (!errorNotification || !query.isError || !query.error) {
      if (!query.isError) notifiedError.current = null;
      return;
    }

    if (notifiedError.current === query.error) return;
    notifiedError.current = query.error;

    const description =
      typeof errorNotification === "function"
        ? errorNotification(query.error)
        : errorNotification;

    openNotification(notification, {
      type: "error",
      title: "Truy vấn dữ liệu thất bại",
      description: description || getApiErrorMessage(query.error),
    });
  }, [errorNotification, notification, query.error, query.isError]);

  return query;
}
