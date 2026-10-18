import type {
  ApiResponse,
  ChangePassForm,
  User,
  UserCreate,
  UserResetPass,
  UserResponse,
  UserUpdate,
} from "@/types";
import axiosClient from "./axios";

export const userService = {
  getAllUsers: (): Promise<ApiResponse<User[]>> => axiosClient.get("/users"),

  getUserById: (userId: number): Promise<ApiResponse<User>> =>
    axiosClient.get(`/users/${userId}`),

  createUser: (data: UserCreate): Promise<ApiResponse<UserResponse>> =>
    axiosClient.post("/users", {
      full_name: data.fullName,
      email: data.email,
      password: data.password,
      role_id: data.roleId,
      phone: data.phone,
      username: data.username,
      date_of_birth: data.dateOfBirth,
      is_female: data.isFemale,
      is_student: data.isStudent,
      is_locked: data.isLocked,
      ggid: data.ggid,
      avatar_url: data.avatarUrl,
    }),

  changePassword: ({
    userId,
    data,
  }: {
    userId: number;
    data: ChangePassForm;
  }): Promise<ApiResponse<boolean>> =>
    axiosClient.post(`/users/${userId}/change-password`, {
      current_password: data.currentPassword,
      new_password: data.newPassword,
      new_password_confirmation: data.newPasswordConfirmation,
    }),

  updateUser: ({
    userId,
    data,
  }: {
    userId: number;
    data: UserUpdate;
  }): Promise<ApiResponse<UserResponse>> =>
    axiosClient.put(`/users/${userId}`, {
      ...(data.fullName !== undefined && { full_name: data.fullName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.roleId !== undefined && { role_id: data.roleId }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.username !== undefined && { username: data.username }),
      ...(data.dateOfBirth !== undefined && {
        date_of_birth: data.dateOfBirth,
      }),
      ...(data.isFemale !== undefined && { is_female: data.isFemale }),
      ...(data.isStudent !== undefined && { is_student: data.isStudent }),
      ...(data.isLocked !== undefined && { is_locked: data.isLocked }),
      ...(data.ggid !== undefined && { ggid: data.ggid }),
      ...(data.avatarUrl !== undefined && { avatar_url: data.avatarUrl }),
    }),

  deleteUser: (userId: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/users/${userId}`),

  getTeachers: (): Promise<ApiResponse<User[]>> =>
    axiosClient.get("/users/teachers"),

  resetUserPassword: ({
    userId,
    data,
  }: {
    userId: number;
    data: UserResetPass;
  }): Promise<ApiResponse<boolean>> =>
    axiosClient.post(`/users/${userId}/reset-password`, {
      new_password: data.newPassword,
      new_password_confirmation: data.newPasswordConfirmation ?? data.newPassword,
    }),
};
