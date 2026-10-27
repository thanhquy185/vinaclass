import { Form } from "antd";
import { KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserIdentityCard } from "@/features/identity/components/UserIdentityCard";
import type { Role } from "@/shared/types";
import { UserValidate } from "@/features/identity/utils/user.validate";
import { getUserSystemRoleCode } from "@/shared/utils/role";
import { AdminFormSection, AdminTextField } from "@/shared/components/admin";
import { AppDialog, Button } from "@/shared/components/ui";
import {
  requiredFieldRule,
  translatedValidationRule,
} from "@/shared/utils/validation";
import type { User, UserResetPass } from "@/features/identity/types/identity";
import type { Rule } from "antd/es/form";

interface UserPasswordChangeFormValues {
  newPassword: string;
  newPasswordConfirmation: string;
}

interface UserPasswordChangeDialogProps {
  user: User;
  roles: Role[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (userId: number, data: UserResetPass) => Promise<boolean>;
}

export function UserPasswordChangeDialog({
  user,
  roles,
  isSaving,
  onClose,
  onSubmit,
}: UserPasswordChangeDialogProps) {
  const { t } = useTranslation("common");
  const [form] = Form.useForm<UserPasswordChangeFormValues>();
  const role = roles.find((item) => item.id === user.roleId);
  const roleCode = getUserSystemRoleCode(user, roles);
  const roleLabel =
    (roleCode
      ? t(`userPage.roles.${roleCode.toLowerCase()}`)
      : role?.roleName) ?? t("userPage.roles.assigned");
  const passwordRules: Rule[] = [
    requiredFieldRule(t("userPage.validation.passwordRequired"), {
      whitespace: true,
    }),
    translatedValidationRule(UserValidate.getAccountPasswordError, t),
  ];
  const passwordConfirmationRules: Rule[] = [
    requiredFieldRule(t("userPage.passwordDialog.confirmationRequired"), {
      whitespace: true,
    }),
    {
      validator: (_rule, value: string | undefined) => {
        if (!value || value === form.getFieldValue("newPassword")) {
          return Promise.resolve();
        }

        return Promise.reject(
          new Error(t("userPage.passwordDialog.passwordMismatch"))
        );
      },
    },
  ];

  const handleSubmit = async (values: UserPasswordChangeFormValues) => {
    await onSubmit(user.id, {
      newPassword: values.newPassword,
      newPasswordConfirmation: values.newPasswordConfirmation,
    });
  };

  return (
    <AppDialog
      open
      onClose={onClose}
      title={t("userPage.passwordDialog.title")}
      description={t("userPage.passwordDialog.description")}
      icon={<KeyRound size={21} />}
      tone="primary"
      width="min(680px, calc(100vw - 32px))"
      busy={isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onClose}
            disabled={isSaving}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            htmlType="submit"
            form="user-password-change-form"
            loading={isSaving}
            disabled={isSaving}
          >
            {t("userPage.passwordDialog.submit")}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 px-5 py-5 sm:px-6">
        <UserIdentityCard
          name={user.profile.fullName || user.username}
          secondaryText={`${user.username} · ${user.email}`}
          avatarUrl={user.profile.avatarUrl}
          roleLabel={roleLabel}
          statusLabel={t(
            user.isLocked
              ? "userPage.status.locked"
              : "userPage.status.active"
          )}
          isLocked={user.isLocked}
        />

        <Form
          id="user-password-change-form"
          form={form}
          layout="vertical"
          requiredMark={false}
          autoComplete="off"
          onFinish={handleSubmit}
        >
          <AdminFormSection
            title={t("userPage.passwordDialog.formTitle")}
            description={t("userPage.passwordDialog.passwordPolicy")}
          >
            <div className="space-y-3">
              <AdminTextField
                name="newPassword"
                label={t("userPage.passwordDialog.newPassword")}
                placeholder={t(
                  "userPage.passwordDialog.newPasswordPlaceholder"
                )}
                rules={passwordRules}
                type="password"
                autoComplete="new-password"
              />
              <AdminTextField
                name="newPasswordConfirmation"
                label={t("userPage.passwordDialog.confirmation")}
                placeholder={t(
                  "userPage.passwordDialog.confirmationPlaceholder"
                )}
                dependencies={["newPassword"]}
                rules={passwordConfirmationRules}
                type="password"
                autoComplete="new-password"
              />
            </div>
          </AdminFormSection>
        </Form>
      </div>
    </AppDialog>
  );
}
