import type { Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";
import type { UserRoleOption } from "@/features/identity/types/userForm";
import { AdminSelectField } from "@/shared/components/admin";

interface UserRoleFieldProps {
  isView: boolean;
  canViewRoles: boolean;
  roleSelection: UserRoleOption[];
  roleRules: Rule[];
  roleRequired: boolean;
}

export default function UserRoleField({
  isView,
  canViewRoles,
  roleSelection,
  roleRules,
  roleRequired,
}: UserRoleFieldProps) {
  const { t } = useTranslation();

  return (
    <AdminSelectField
      label={t("userForm.role")}
      name="roleId"
      rules={roleRules}
      required={roleRequired}
      placeholder={t("userForm.rolePlaceholder")}
      options={roleSelection}
      disabled={isView || !canViewRoles}
    />
  );
}
