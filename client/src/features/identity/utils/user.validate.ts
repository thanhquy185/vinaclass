export class UserValidate {
  static getAccountDateOfBirthError(value?: string): string | undefined {
    if (!value) return undefined;

    const [year, month, day] = value.split("-").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isValidDate =
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      birthDate.getFullYear() === year &&
      birthDate.getMonth() === month - 1 &&
      birthDate.getDate() === day;

    return isValidDate && birthDate < today
      ? undefined
      : "userPage.validation.dobInvalid";
  }

  static getAccountPasswordError(value?: string): string | undefined {
    if (!value?.trim()) return undefined;

    return UserValidate.password(value) ?? undefined;
  }

  static getAccountRoleError(
    value: number | null | undefined,
    isUpdate: boolean,
    isLegacyStudent: boolean
  ): string | undefined {
    return value != null || (isUpdate && isLegacyStudent)
      ? undefined
      : "userPage.validation.roleRequired";
  }

  static getBirthDateError(
    value: string | undefined,
    today: string
  ): string | undefined {
    if (!value) return undefined;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value >= today) {
      return "profile.validation.birthDateInvalid";
    }

    return undefined;
  }

  static password(value: string): string | null {
    if (!value?.trim()) {
      return "userPage.validation.passwordRequired";
    }
    if (value.length < 6) {
      return "userPage.validation.passwordMinLength";
    }
    if (!/\p{L}/u.test(value)) {
      return "userPage.validation.passwordLetterRequired";
    }
    if (!/\p{N}/u.test(value)) {
      return "userPage.validation.passwordNumberRequired";
    }
    if (!/\p{Lu}/u.test(value) || !/\p{Ll}/u.test(value)) {
      return "userPage.validation.passwordCaseRequired";
    }

    return null;
  }

  static getNewPasswordError(
    value: string | undefined,
    currentPassword: string | undefined
  ): string | undefined {
    const passwordError = UserValidate.password(value ?? "");
    if (passwordError) return passwordError;

    return value === currentPassword
      ? "profile.validation.passwordDifferent"
      : undefined;
  }

  static getPasswordConfirmationError(
    value: string | undefined,
    newPassword: string | undefined
  ): string | undefined {
    return value === newPassword
      ? undefined
      : "profile.validation.passwordConfirmMismatch";
  }
}
