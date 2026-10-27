import axios from "axios";
import type { BackendErrors, ErrorResponse } from "@/shared/types";

export interface ApiErrorDetails {
  status?: number;
  message?: string;
  errors?: BackendErrors;
  rawErrors?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeErrors(value: unknown): BackendErrors | undefined {
  if (!isRecord(value)) return undefined;

  const normalizedErrors: BackendErrors = {};

  Object.entries(value).forEach(([field, messages]) => {
    if (typeof messages === "string") {
      normalizedErrors[field] = [messages];
      return;
    }

    if (!Array.isArray(messages)) return;

    const normalizedMessages = messages.filter(
      (message): message is string => typeof message === "string"
    );
    if (normalizedMessages.length > 0) {
      normalizedErrors[field] = normalizedMessages;
    }
  });

  return Object.keys(normalizedErrors).length > 0
    ? normalizedErrors
    : undefined;
}

export function getApiErrorDetails(error: unknown): ApiErrorDetails {
  if (!axios.isAxiosError<ErrorResponse>(error)) {
    return {
      message: error instanceof Error ? error.message : undefined,
    };
  }

  const payload = error.response?.data;
  return {
    status: error.response?.status,
    message:
      typeof payload?.message === "string" ? payload.message : error.message,
    errors: normalizeErrors(payload?.errors),
    rawErrors: payload?.errors,
  };
}

export function getFirstApiValidationMessage(
  errors: BackendErrors | undefined
): string | undefined {
  if (!errors) return undefined;

  for (const messages of Object.values(errors)) {
    const firstMessage = messages.find((message) => message.trim().length > 0);
    if (firstMessage) return firstMessage;
  }

  return undefined;
}

export function getApiValidationMessage(error: unknown): string | undefined {
  const details = getApiErrorDetails(error);
  if (details.status !== 422) return undefined;

  return getFirstApiValidationMessage(details.errors);
}

export function hasApiFieldError(
  errors: BackendErrors | undefined,
  field: string
): boolean {
  if (!errors) return false;

  const normalizeField = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalizeField(field);

  return Object.entries(errors).some(
    ([key, messages]) => normalizeField(key) === target && messages.length > 0
  );
}

export function getApiErrorMessage(error: unknown): string | undefined {
  const details = getApiErrorDetails(error);
  return getFirstApiValidationMessage(details.errors) ?? details.message;
}
