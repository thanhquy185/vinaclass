import type {
  ApiResponse,
  Role,
  RoleCreate,
  RoleDetail,
  RoleResponse,
  RoleNameSortDirection,
  RoleUpdate,
} from "@/shared/types";
import axiosClient from "@/shared/api/axios";

export const roleService = {
  getAll: (
    sortDirection?: RoleNameSortDirection,
  ): Promise<ApiResponse<Role[]>> =>
    axiosClient.get("/roles", {
      params: sortDirection
        ? { sort_by: "name", sort_direction: sortDirection }
        : undefined,
    }),

  getById: (id: number): Promise<ApiResponse<RoleDetail>> =>
    axiosClient.get(`/roles/${id}`),

  create: (data: RoleCreate): Promise<RoleResponse> =>
    axiosClient.post("/roles", data),

  update: ({
    id,
    data,
  }: {
    id: number;
    data: RoleUpdate;
  }): Promise<RoleResponse> =>
    axiosClient.put(`/roles/${id}`, data),

  delete: (id: number): Promise<boolean> =>
    axiosClient.delete(`/roles/${id}`),
};
