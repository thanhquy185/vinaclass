import { Form, Input, Radio } from "antd";
import type { FormInstance } from "antd";
import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { TextField } from "@/shared/components/ui/TextField/TextField";
import type { User } from "@/features/identity/types/identity";
import type { ProfileFormValues } from "@/features/identity/types/profileForm";
import { UserValidate } from "@/features/identity/utils/user.validate";
import { FormField } from "@/shared/components/ui";
import {
  maxLengthRule,
  requiredFieldRule,
  translatedValidationRule,
} from "@/shared/utils/validation";

interface ProfileDetailsFormProps {
  user: User | null;
  form: FormInstance<ProfileFormValues>;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
}

const getTodayDate = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
};

export default function ProfileDetailsForm({
  user,
  form,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSubmit,
}: ProfileDetailsFormProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full min-w-0 space-y-4 duration-500 animate-in fade-in">
      <div className="flex flex-col gap-3 border-b border-other-divider pb-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-h6 font-bold text-text-primary">
          {t("profile.details.title")}
        </h2>
        <div className="flex flex-wrap justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                color="standard"
                size="medium"
                type="button"
                disabled={isSaving}
                onClick={onCancel}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                type="submit"
                form="own-profile-form"
                disabled={isSaving}
              >
                {isSaving ? t("profile.saving") : t("profile.save")}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              color="primary"
              size="medium"
              type="button"
              onClick={onEdit}
            >
              <Pencil size={16} />
              {t("profile.edit")}
            </Button>
          )}
        </div>
      </div>

      <Form
        id="own-profile-form"
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2"
      >
        {isEditing ? (
          <FormField
            name="fullName"
            label={t("profile.details.fullName")}
            rules={[
              requiredFieldRule(t("profile.validation.fullNameRequired"), {
                whitespace: true,
              }),
              maxLengthRule(255, t("profile.validation.fullNameMaxLength")),
            ]}
          >
            <Input autoComplete="name" disabled={isSaving} />
          </FormField>
        ) : (
          <TextField
            label={t("profile.details.fullName")}
            value={user?.profile.fullName}
            readOnly
          />
        )}
        <TextField
          label={t("profile.details.identityCode")}
          value={user?.code ?? ""}
          readOnly
        />
        <TextField
          label={t("profile.details.contactEmail")}
          value={user?.email}
          readOnly
        />
        {isEditing ? (
          <FormField
            name="phone"
            label={t("profile.details.phone")}
            rules={[maxLengthRule(20, t("profile.validation.phoneMaxLength"))]}
          >
            <Input autoComplete="tel" disabled={isSaving} />
          </FormField>
        ) : (
          <TextField
            label={t("profile.details.phone")}
            value={user?.profile.phone ?? ""}
            readOnly
          />
        )}
        {isEditing ? (
          <FormField
            name="dateOfBirth"
            label={t("profile.details.birthDate")}
            rules={[
              translatedValidationRule(
                (value: string | undefined) =>
                  UserValidate.getBirthDateError(value, getTodayDate()),
                t
              ),
            ]}
          >
            <Input type="date" max={getTodayDate()} disabled={isSaving} />
          </FormField>
        ) : (
          <TextField
            label={t("profile.details.birthDate")}
            value={user?.profile.dateOfBirth ?? ""}
            readOnly
          />
        )}

        {isEditing ? (
          <FormField
            name="isFemale"
            label={t("profile.details.gender")}
            rules={[requiredFieldRule(t("profile.validation.genderRequired"))]}
          >
            <Radio.Group disabled={isSaving}>
              <Radio value={false}>{t("profile.details.genderMale")}</Radio>
              <Radio value={true}>{t("profile.details.genderFemale")}</Radio>
            </Radio.Group>
          </FormField>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-body-2-semibold text-text-secondary">
              {t("profile.details.gender")}
            </label>
            <div className="text-body-2 py-2 font-medium text-text-primary">
              {user?.profile.isFemale
                ? t("profile.details.genderFemale")
                : t("profile.details.genderMale")}
            </div>
          </div>
        )}

        <div className="mt-2 rounded-lg border border-success-background bg-success-background p-3 md:col-span-2">
          <p className="text-caption font-bold uppercase tracking-widest text-alert-success-content">
            {t("profile.systemStatus.title")}
          </p>
          <p className="text-body-2 mt-1.5 leading-relaxed text-text-primary">
            {t("profile.systemStatus.description", { system: "NDT15" })}
          </p>
        </div>
      </Form>
    </div>
  );
}
