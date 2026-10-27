import { useTranslation } from "react-i18next";
import { AdminTextField } from "@/shared/components/admin";
import type { Rule } from "antd/es/form";

interface UserPasswordFieldsProps {
  isView: boolean;
  isUpdate: boolean;
  passwordRules: Rule[];
}

export default function UserPasswordFields({
  isView,
  isUpdate,
  passwordRules,
}: UserPasswordFieldsProps) {
  const { t } = useTranslation();

  if (isView) return null;

  if (isUpdate) {
    return (
      <AdminTextField
        label={t("userForm.password")}
        type="password"
        placeholder={t("userForm.passwordChangeHint")}
        disabled
        autoComplete="new-password"
      />
    );
  }

  return (
    <AdminTextField
      name="password"
      rules={passwordRules}
      label={t("userForm.password")}
      type="password"
      placeholder={t("userForm.passwordPlaceholder")}
      autoComplete="new-password"
    />
  );
}
