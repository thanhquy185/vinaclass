import type {
  ApiResponse,
  FunctionCatalogItem,
  PermissionNavigationResponse,
  RolePermissionMatrix,
  UserPermissionOverrideMatrix,
} from "@/shared/types";
import axiosClient from "@/shared/api/axios";

export const authorizationService = {
  getFunctionCatalog: (): Promise<ApiResponse<FunctionCatalogItem[]>> =>
    axiosClient.get("/functions"),
  getMyNavigation: (): Promise<ApiResponse<PermissionNavigationResponse>> =>
    axiosClient.get("/me/navigation"),
  getRoleMatrix: (roleId: number): Promise<ApiResponse<RolePermissionMatrix>> =>
    axiosClient.get(`/roles/${roleId}/permission-matrix`),
  syncRolePermissions: (
    roleId: number,
    permissionIds: number[]
  ): Promise<ApiResponse<{ roleId: number; permissionIds: number[] }>> =>
    axiosClient.put(`/roles/${roleId}/permissions`, {
      permissionIds,
    }),
  getUserPermissionOverrides: (
    userId: number
  ): Promise<ApiResponse<UserPermissionOverrideMatrix>> =>
    axiosClient.get(`/users/${userId}/permission-overrides`),
  syncUserPermissionOverrides: (
    userId: number,
    overrides: { permissionId: number; effect: "GRANT" | "DENY" }[]
  ): Promise<ApiResponse<{ userId: number }>> =>
    axiosClient.put(`/users/${userId}/permission-overrides`, { overrides }),
};
