import type { RoleResponse } from "./authorization";
import type { User } from "./identity";

export interface ChangePassForm {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface GoogleUser {
  username: string | null;
  email: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: GoogleUser;
  error?: string;
}

export interface LoginFormSubmit {
  login: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  me: User;
  role: RoleResponse | null;
}
