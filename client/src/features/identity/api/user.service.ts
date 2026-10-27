import type { ApiResponse, ChangePassForm, Role } from "@/shared/types";
import type {
  OwnProfileUpdate,
  User,
  UserCreate,
  UserResetPass,
  UserResponse,
  UserUpdate,
} from "@/features/identity/types/identity";
import axiosClient from "@/shared/api/axios";
import {
  mapOwnProfilePayload,
  mapPasswordChangePayload,
  mapPasswordResetPayload,
  mapUser,
  mapUserCreatePayload,
  mapUserUpdatePayload,
} from "./user.mapper";
import type { RawUser } from "./user.mapper";

export const userService = {
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = (await axiosClient.get(
      "/users"
    )) as unknown as ApiResponse<RawUser[]>;
    return { ...response, data: response.data.map(mapUser) };
  },

  getAssignableRoles: (): Promise<ApiResponse<Role[]>> =>
    axiosClient.get("/users/roles"),

  getUserById: async (userId: number): Promise<ApiResponse<User>> => {
    const response = (await axiosClient.get(
      `/users/${userId}`
    )) as unknown as ApiResponse<RawUser>;
    return { ...response, data: mapUser(response.data) };
  },

  createUser: async (data: UserCreate): Promise<ApiResponse<UserResponse>> => {
    const response = (await axiosClient.post(
      "/users",
      mapUserCreatePayload(data)
    )) as unknown as ApiResponse<RawUser>;
    return { ...response, data: mapUser(response.data) };
  },

  changePassword: ({
    userId,
    data,
  }: {
    userId: number;
    data: ChangePassForm;
  }): Promise<ApiResponse<boolean>> =>
    axiosClient.post(
      `/users/${userId}/change-password`,
      mapPasswordChangePayload(data)
    ),

  updateUser: async ({
    userId,
    data,
  }: {
    userId: number;
    data: UserUpdate;
  }): Promise<ApiResponse<UserResponse>> => {
    const response = (await axiosClient.put(
      `/users/${userId}`,
      mapUserUpdatePayload(data)
    )) as unknown as ApiResponse<RawUser>;
    return { ...response, data: mapUser(response.data) };
  },

  updateUserLock: ({
    userId,
    isLocked,
  }: {
    userId: number;
    isLocked: boolean;
  }): Promise<ApiResponse<boolean>> =>
    axiosClient.patch(`/users/${userId}/lock`, { is_locked: isLocked }),

  updateOwnProfile: async (
    data: OwnProfileUpdate
  ): Promise<ApiResponse<User>> => {
    const response = (await axiosClient.put(
      "/users/me/profile",
      mapOwnProfilePayload(data)
    )) as unknown as ApiResponse<RawUser>;

    return { ...response, data: mapUser(response.data) };
  },

  deleteUser: (userId: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/users/${userId}`),

  getTeachers: async (): Promise<ApiResponse<User[]>> => {
    const response = (await axiosClient.get(
      "/users/teachers"
    )) as unknown as ApiResponse<RawUser[]>;
    return { ...response, data: response.data.map(mapUser) };
  },

  resetUserPassword: ({
    userId,
    data,
  }: {
    userId: number;
    data: UserResetPass;
  }): Promise<ApiResponse<boolean>> =>
    axiosClient.post(
      `/users/${userId}/reset-password`,
      mapPasswordResetPayload(data)
    ),
};
