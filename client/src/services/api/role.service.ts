import type {
  ApiResponse,
  Role,
  RoleCreate,
  RoleDetail,
  RoleResponse,
  RoleUpdate,
} from "@/types";
import axiosClient from "./axios";

export const roleService = {
  getAll: (): Promise<ApiResponse<Role[]>> => axiosClient.get("/roles"),

  getById: (id: number): Promise<ApiResponse<RoleDetail>> =>
    axiosClient.get(`/roles/${id}`),

  create: (data: RoleCreate): Promise<ApiResponse<RoleResponse>> =>
    axiosClient.post("/roles", data),

  update: ({
    id,
    data,
  }: {
    id: number;
    data: RoleUpdate;
  }): Promise<ApiResponse<RoleResponse>> =>
    axiosClient.put(`/roles/${id}`, data),

  delete: (id: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/roles/${id}`),
};
