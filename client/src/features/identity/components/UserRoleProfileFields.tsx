import { useTranslation } from "react-i18next";
import { UserInfoSection } from "@/features/identity/components/UserInfoSection";
import {
  maxLengthRule,
  requiredFieldRule,
} from "@/shared/utils/validation";
import { AdminTextField } from "@/shared/components/admin";

interface UserRoleProfileFieldsProps {
  isView: boolean;
  selectedRoleCode: string | null;
}

export default function UserRoleProfileFields({
  isView,
  selectedRoleCode,
}: UserRoleProfileFieldsProps) {
  const { t } = useTranslation();
  const profileFieldRules = [
    requiredFieldRule(t("userPage.validation.profileFieldRequired"), {
      whitespace: true,
    }),
    maxLengthRule(255, t("userPage.validation.profileFieldMaxLength")),
  ];

  return (
    <>
      {selectedRoleCode === "TEACHER" && (
        <UserInfoSection
          title={t("userForm.teacherProfile.title")}
          className="mt-5"
        >
          <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <AdminTextField
              name={["teacherProfile", "teacherCode"]}
              rules={profileFieldRules}
              required
              label={t("userForm.teacherProfile.teacherCode")}
              disabled={isView}
              maxLength={255}
            />
            <AdminTextField
              name={["teacherProfile", "departmentName"]}
              rules={profileFieldRules}
              required
              label={t("userForm.teacherProfile.departmentName")}
              disabled={isView}
              maxLength={255}
            />
            <AdminTextField
              name={["teacherProfile", "academicTitle"]}
              rules={profileFieldRules}
              required
              label={t("userForm.teacherProfile.academicTitle")}
              disabled={isView}
              maxLength={255}
            />
          </dl>
        </UserInfoSection>
      )}

      {selectedRoleCode === "STUDENT" && (
        <UserInfoSection
          title={t("userForm.studentProfile.title")}
          className="mt-5"
        >
          <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <AdminTextField
              name={["studentProfile", "studentCode"]}
              rules={profileFieldRules}
              required
              label={t("userForm.studentProfile.studentCode")}
              disabled={isView}
              maxLength={255}
            />
            <AdminTextField
              name={["studentProfile", "programName"]}
              rules={profileFieldRules}
              required
              label={t("userForm.studentProfile.programName")}
              disabled={isView}
              maxLength={255}
            />
            <AdminTextField
              name={["studentProfile", "cohort"]}
              rules={profileFieldRules}
              required
              label={t("userForm.studentProfile.cohort")}
              disabled={isView}
              maxLength={255}
            />
          </dl>
        </UserInfoSection>
      )}
    </>
  );
}
