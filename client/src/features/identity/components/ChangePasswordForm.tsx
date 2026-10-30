import { Form, Input } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui";
import type { ChangePassForm } from "@/shared/types";
import { UserValidate } from "@/features/identity/utils/user.validate";
import { FormField } from "@/shared/components/ui";
import {
  requiredFieldRule,
  translatedValidationRule,
} from "@/shared/utils/validation";

interface ChangePasswordFormProps {
  form: FormInstance<ChangePassForm>;
  isChanging: boolean;
  onSubmit: (values: ChangePassForm) => void | Promise<void>;
  onCancel: () => void;
}

export default function ChangePasswordForm({
  form,
  isChanging,
  onSubmit,
  onCancel,
}: ChangePasswordFormProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full min-w-0 space-y-4 duration-500 animate-in slide-in-from-right-4">
      <div className="border-b border-other-divider pb-4">
        <h2 className="text-h6 font-bold text-text-primary">
          {t("profile.password.title")}
        </h2>
        <p className="text-helper-text mt-1 text-text-secondary">
          {t("profile.password.subtitle")}
        </p>
        <Link to="/forgot-password" className="mt-2 inline-block text-primary-main underline">
          {t("profile.password.resetByEmail")}
        </Link>
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          currentPassword: "",
          newPassword: "",
          newPasswordConfirmation: "",
        }}
        onFinish={onSubmit}
        className="space-y-6"
      >
        <FormField
          name="currentPassword"
          label={t("profile.password.current")}
          rules={[
            requiredFieldRule(t("profile.validation.currentPasswordRequired"), {
              whitespace: true,
            }),
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isChanging}
          />
        </FormField>
        <div className="h-px w-full bg-other-divider"></div>
        <FormField
          name="newPassword"
          label={t("profile.password.new")}
          dependencies={["currentPassword"]}
          rules={[
            translatedValidationRule(
              (value: string | undefined) =>
                UserValidate.getNewPasswordError(
                  value,
                  form.getFieldValue("currentPassword")
                ),
              t
            ),
          ]}
        >
          <Input.Password
            placeholder={t("profile.password.newPlaceholder")}
            autoComplete="new-password"
            disabled={isChanging}
          />
        </FormField>
        <FormField
          name="newPasswordConfirmation"
          label={t("profile.password.confirm")}
          dependencies={["newPassword"]}
          rules={[
            translatedValidationRule(
              (value: string | undefined) =>
                UserValidate.getPasswordConfirmationError(
                  value,
                  form.getFieldValue("newPassword")
                ),
              t
            ),
          ]}
        >
          <Input.Password
            placeholder={t("profile.password.confirmPlaceholder")}
            autoComplete="new-password"
            disabled={isChanging}
          />
        </FormField>
        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="contained"
            color="primary"
            size="large"
            className="font-bold"
            type="submit"
            disabled={isChanging}
          >
            {isChanging
              ? t("profile.password.updating")
              : t("profile.password.update")}
          </Button>
          <Button
            variant="outline"
            color="standard"
            size="large"
            className="font-bold"
            type="button"
            disabled={isChanging}
            onClick={onCancel}
          >
            {t("profile.password.cancel")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
