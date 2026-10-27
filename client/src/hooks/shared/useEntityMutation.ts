import { App } from "antd";
import {
  useMutation,
  useQueryClient,
  type MutationFunction,
  type MutationFunctionContext,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useId } from "react";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import {
  closeNotification,
  openNotification,
} from "@/utils/showNotificationUtil";

type NotificationText<TValue> = string | ((value: TValue) => string);

export interface EntityMutationNotifications<TData, TVariables, TError> {
  pending?: NotificationText<TVariables>;
  success?: NotificationText<TData>;
  error?: NotificationText<TError>;
}

export type UseEntityMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationFn" | "onSuccess" | "onError" | "onMutate" | "onSettled"
> & {
  mutationFn: MutationFunction<TData, TVariables>;
  invalidateKeys?:
    | readonly QueryKey[]
    | ((data: TData, variables: TVariables) => readonly QueryKey[]);
  waitForInvalidation?: boolean;
  notifications?: EntityMutationNotifications<TData, TVariables, TError>;
  onSuccessBeforeInvalidation?: (data: TData, variables: TVariables) => void;
  onMutate?: (
    variables: TVariables,
    context: MutationFunctionContext
  ) => TContext | undefined | Promise<TContext | undefined>;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    onMutateResult: TContext | undefined,
    context: MutationFunctionContext
  ) => void | Promise<void>;
  onError?: (
    error: TError,
    variables: TVariables,
    onMutateResult: TContext | undefined,
    context: MutationFunctionContext
  ) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    onMutateResult: TContext | undefined,
    context: MutationFunctionContext
  ) => void | Promise<void>;
};

function resolveText<TValue>(
  text: NotificationText<TValue>,
  value: TValue
): string {
  return typeof text === "function" ? text(value) : text;
}

export function useEntityMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>({
  mutationFn,
  invalidateKeys,
  waitForInvalidation = false,
  notifications,
  onSuccessBeforeInvalidation,
  onMutate,
  onSuccess,
  onError,
  onSettled,
  ...mutationOptions
}: UseEntityMutationOptions<TData, TError, TVariables, TContext>) {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const notificationKey = useId();

  return useMutation({
    ...mutationOptions,
    mutationFn,
    onMutate: async (variables, context) => {
      if (notifications?.pending) {
        openNotification(notification, {
          key: notificationKey,
          type: "info",
          title: resolveText(notifications.pending, variables),
          description: "Vui lòng chờ giây lát",
          duration: false,
        });
      }

      return onMutate?.(variables, context);
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      if (notifications?.pending) {
        closeNotification(notification, notificationKey);
      }

      onSuccessBeforeInvalidation?.(data, variables);

      const keys =
        typeof invalidateKeys === "function"
          ? invalidateKeys(data, variables)
          : (invalidateKeys ?? []);
      const invalidations = keys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey })
      );
      const successResult = onSuccess?.(
        data,
        variables,
        onMutateResult,
        context
      );

      if (notifications?.success) {
        openNotification(notification, {
          type: "success",
          key: notificationKey,
          title: "Thành công",
          description: resolveText(notifications.success, data),
        });
      }

      if (waitForInvalidation) {
        return Promise.all(invalidations).then(() => successResult);
      }

      return successResult;
    },
    onError: (error, variables, onMutateResult, context) => {
      if (notifications?.pending) {
        closeNotification(notification, notificationKey);
      }

      if (notifications?.error) {
        const description = resolveText(notifications.error, error);
        openNotification(notification, {
          type: "error",
          key: notificationKey,
          title: "Thất bại",
          description: description || getApiErrorMessage(error),
        });
      }

      return onError?.(error, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context) =>
      onSettled?.(data, error, variables, onMutateResult, context),
  });
}
