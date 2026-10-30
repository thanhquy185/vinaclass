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

export interface AuthOtpChallenge {
  publicId: string;
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
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
    data: RegisterStudentInput & {
      otpPublicId: string;
      otpVerificationToken: string;
    }
  ): Promise<LoginResponse> => {
    const res = await axiosClient.post("/register", {
      full_name: data.fullName,
      student_code: data.studentCode,
      email: data.email,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
      otp_public_id: data.otpPublicId,
      otp_verification_token: data.otpVerificationToken,
    });
    return mapLoginResponse(res.data as RawLoginResponse);
  },
  requestRegistrationOtp: async (email: string): Promise<AuthOtpChallenge> => {
    const res = await axiosClient.post("/auth/otp/register", { email });
    return res.data as AuthOtpChallenge;
  },
  requestPasswordResetOtp: async (email: string): Promise<AuthOtpChallenge> => {
    const res = await axiosClient.post("/auth/otp/forgot-password", { email });
    return res.data as AuthOtpChallenge;
  },
  verifyOtp: async (publicId: string, code: string): Promise<string> => {
    const res = await axiosClient.post("/auth/otp/verify", {
      public_id: publicId,
      code,
    });
    return res.data.verificationToken as string;
  },
  resendOtp: async (publicId: string): Promise<AuthOtpChallenge> => {
    const res = await axiosClient.post(
      `/auth/otp/resend/${encodeURIComponent(publicId)}`
    );
    return res.data as AuthOtpChallenge;
  },
  resetPasswordWithOtp: async (
    publicId: string,
    verificationToken: string,
    newPassword: string,
    passwordConfirmation: string
  ): Promise<void> => {
    await axiosClient.post("/auth/otp/reset-password", {
      public_id: publicId,
      verification_token: verificationToken,
      new_password: newPassword,
      new_password_confirmation: passwordConfirmation,
    });
  },
  logout: async (): Promise<void> => {
    await axiosClient.post("/logout");
  },
  me: async (): Promise<LoginResponse> => {
    const res = await axiosClient.get("/me");
    return mapLoginResponse(res.data as RawLoginResponse);
  },
};
