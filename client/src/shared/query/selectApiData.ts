import type { ApiResponse } from "@/shared/types";

export function selectApiData<TData>(response: ApiResponse<TData>): TData {
  return response.data;
}
