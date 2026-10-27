import type { Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";
import UserPasswordFields from "@/features/identity/components/UserPasswordFields";
import UserRoleField from "@/features/identity/components/UserRoleField";
import UserRoleProfileFields from "@/features/identity/components/UserRoleProfileFields";
import { UserInfoSection } from "@/features/identity/components/UserInfoSection";
import type { UserRoleOption } from "@/features/identity/types/userForm";
import {
  AdminDateField,
  AdminRadioGroupField,
  AdminTextField,
} from "@/shared/components/admin";
import { maxLengthRule, requiredFieldRule } from "@/shared/utils/validation";

export type { UserFormValues } from "@/features/identity/types/userForm";

interface UserFormFieldsProps {
  isView: boolean;
  isUpdate: boolean;
  canViewRoles: boolean;
  roleSelection: UserRoleOption[];
  selectedRoleCode: string | null;
  dateOfBirthRules: Rule[];
  passwordRules: Rule[];
  roleRules: Rule[];
  roleRequired: boolean;
}

export function UserFormFields({
  isView,
  isUpdate,
  canViewRoles,
  roleSelection,
  selectedRoleCode,
  dateOfBirthRules,
  passwordRules,
  roleRules,
  roleRequired,
}: UserFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <UserInfoSection title={t("userPage.formSections.credentials")}>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <AdminTextField
            name="username"
            rules={[
              requiredFieldRule(t("userPage.validation.usernameRequired"), {
                whitespace: true,
              }),
              maxLengthRule(255, t("userPage.validation.usernameMaxLength")),
            ]}
            label={t("userForm.username")}
            placeholder={t("userForm.usernamePlaceholder")}
            disabled={isView || isUpdate}
            maxLength={255}
          />
          <AdminTextField
            name="email"
            rules={[
              requiredFieldRule(t("userPage.validation.emailRequired"), {
                whitespace: true,
              }),
              {
                type: "email",
                message: t("userPage.validation.emailInvalid"),
              },
              maxLengthRule(255, t("userPage.validation.emailMaxLength")),
            ]}
            label={t("userForm.email")}
            type="email"
            placeholder={t("userForm.emailPlaceholder")}
            disabled={isView}
            maxLength={255}
          />
          <UserRoleField
            isView={isView}
            canViewRoles={canViewRoles}
            roleSelection={roleSelection}
            roleRules={roleRules}
            roleRequired={roleRequired}
          />
          <UserPasswordFields
            isView={isView}
            isUpdate={isUpdate}
            passwordRules={passwordRules}
          />
        </div>
      </UserInfoSection>

      <UserInfoSection title={t("userPage.formSections.profile")}>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <AdminTextField
            name="fullName"
            rules={[
              requiredFieldRule(t("userPage.validation.fullNameRequired"), {
                whitespace: true,
              }),
              maxLengthRule(255, t("userPage.validation.fullNameMaxLength")),
            ]}
            label={t("userForm.fullName")}
            placeholder={t("userForm.fullNamePlaceholder")}
            disabled={isView}
            maxLength={255}
          />

          <AdminTextField
            name="phone"
            rules={[maxLengthRule(20, t("userPage.validation.phoneMaxLength"))]}
            label={t("userForm.phone")}
            type="tel"
            placeholder={t("userForm.phonePlaceholder")}
            disabled={isView}
            maxLength={20}
          />

          <AdminRadioGroupField
            label={t("userForm.gender")}
            name="isFemale"
            disabled={isView}
            options={[
              { label: t("userForm.male"), value: false },
              { label: t("userForm.female"), value: true },
            ]}
          />

          <AdminDateField
            name="dateOfBirth"
            rules={dateOfBirthRules}
            label={t("userForm.dateOfBirth")}
            disabled={isView}
          />
        </div>
      </UserInfoSection>

      <UserRoleProfileFields
        isView={isView}
        selectedRoleCode={selectedRoleCode}
      />
    </div>
  );
}
