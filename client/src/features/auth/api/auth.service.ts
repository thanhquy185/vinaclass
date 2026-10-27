import axiosClient from "@/shared/api/axios";
import type { LoginResponse } from "@/shared/types";
import { mapUser, type RawUser } from "@/features/identity/api/user.mapper";

type RawLoginResponse = Omit<LoginResponse, "me"> & { me: RawUser };

export interface RegisterStudentInput {
  fullName: string;
  studentCode: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const mapLoginResponse = (value: RawLoginResponse): LoginResponse => ({
  ...value,
  me: mapUser(value.me),
});

export const authService = {
  login: async (data: {
    login: string;
    password: string;
  }): Promise<LoginResponse> => {
    const res = await axiosClient.post("/login", data);
    return mapLoginResponse(res.data as RawLoginResponse);
  },
  registerStudent: async (
    data: RegisterStudentInput
  ): Promise<LoginResponse> => {
    const res = await axiosClient.post("/register", {
      full_name: data.fullName,
      student_code: data.studentCode,
      email: data.email,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
    });
    return mapLoginResponse(res.data as RawLoginResponse);
  },
  me: async (): Promise<LoginResponse> => {
    const res = await axiosClient.get("/me");
    return mapLoginResponse(res.data as RawLoginResponse);
  },
  setCookie: async () => {
    const res = await axiosClient.post("/auth/set-cookie");
    return res.data;
  },
};
