import type { UserCreate } from "@/types";

// dùng cho update (bỏ password)
export type UserUpdateInput = Omit<UserCreate, "password">;
export type UserError = Partial<Record<keyof UserCreate, string>>;

export class UserValidate {
  // 👉 CREATE (có password)
  static create(data: UserCreate): UserError {
    const errors: UserError = {};

    if (!data.username || data.username.trim() === "") {
      errors.username = "userPage.validation.usernameRequired";
    }

    if (!data.email || data.email.trim() === "") {
      errors.email = "userPage.validation.emailRequired";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = "userPage.validation.emailInvalid";
      }
    }

    if (!data.fullName || data.fullName.trim() === "") {
      errors.fullName = "userPage.validation.fullNameRequired";
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = "userPage.validation.dobRequired";
    }

    // 🔥 chỉ có ở CREATE
    if (!data.password || data.password.trim() === "") {
      errors.password = "userPage.validation.passwordRequired";
    }

    if (!data.isStudent && data.roleId === null) {
      errors.roleId = "userPage.validation.roleRequired";
    }

    return errors;
  }

  // 👉 UPDATE (KHÔNG có password)
  static update(data: UserUpdateInput): UserError {
    const errors: UserError = {};

    if (!data.username || data.username.trim() === "") {
      errors.username = "userPage.validation.usernameRequired";
    }

    if (!data.email || data.email.trim() === "") {
      errors.email = "userPage.validation.emailRequired";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = "userPage.validation.emailInvalid";
      }
    }

    if (!data.fullName || data.fullName.trim() === "") {
      errors.fullName = "userPage.validation.fullNameRequired";
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = "userPage.validation.dobRequired";
    }

    if (!data.isStudent && data.roleId === null) {
      errors.roleId = "userPage.validation.roleRequired";
    }

    return errors;
  }
}