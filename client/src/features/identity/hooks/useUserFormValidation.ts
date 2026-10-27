import type { Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";
import { UserValidate } from "@/features/identity/utils/user.validate";
import {
  requiredFieldRule,
  translatedValidationRule,
} from "@/shared/utils/validation";

interface UseUserFormValidationOptions {
  isUpdate: boolean;
  isLegacyStudent: boolean;
}

export function useUserFormValidation({
  isUpdate,
  isLegacyStudent,
}: UseUserFormValidationOptions) {
  const { t } = useTranslation();

  const dateOfBirthRules: Rule[] = [
    translatedValidationRule(UserValidate.getAccountDateOfBirthError, t),
  ];

  const passwordRules: Rule[] = [
    requiredFieldRule(t("userPage.validation.passwordRequired"), {
      whitespace: true,
    }),
    translatedValidationRule(UserValidate.getAccountPasswordError, t),
  ];

  const roleRules: Rule[] = [
    translatedValidationRule(
      (value: number | null | undefined) =>
        UserValidate.getAccountRoleError(value, isUpdate, isLegacyStudent),
      t,
    ),
  ];

  return {
    dateOfBirthRules,
    passwordRules,
    roleRules,
    roleRequired: !(isUpdate && isLegacyStudent),
  };
}
