import { Form } from "antd";
import { UserRoundPen, UserRoundPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Role } from "@/shared/types";
import type {
  User,
  UserCreate,
  UserUpdate,
} from "@/features/identity/types/identity";
import type { UserFormMode } from "@/features/identity/types/userForm";
import { useUserFormController } from "@/features/identity/hooks/useUserFormController";
import { UserFormFields } from "@/features/identity/components/UserFormFields";
import { UserIdentityCard } from "@/features/identity/components/UserIdentityCard";
import { AppDialog, Button } from "@/shared/components/ui";
import {
  getDeclaredSystemRoleCode,
  getSystemRoleCode,
} from "@/shared/utils/role";

export type { UserFormMode } from "@/features/identity/types/userForm";

interface UserFormProps {
  initialData?: User | null;
  onSaveCreate: (data: UserCreate) => void;
  onSaveUpdate: (id: number, data: UserUpdate) => void;
  onCancel: () => void;
  mode: UserFormMode;
  isSaving: boolean;
  canViewRoles: boolean;
  roles: Role[];
}

export function UserForm({
  initialData,
  onSaveCreate,
  onSaveUpdate,
  onCancel,
  mode,
  isSaving,
  canViewRoles,
  roles,
}: UserFormProps) {
  const { t } = useTranslation();
  const {
    form,
    isView,
    isUpdate,
    roleSelection,
    selectedRoleCode,
    defaultFormData,
    dateOfBirthRules,
    passwordRules,
    roleRules,
    roleRequired,
    handleFormValuesChange,
    handleSubmit,
  } = useUserFormController({
    initialData,
    onSaveCreate,
    onSaveUpdate,
    mode,
    canViewRoles,
    roles,
  });

  const modalTitle = t(
    isUpdate ? "userPage.dialog.updateTitle" : "userPage.dialog.createTitle",
  );
  const previewFullName = Form.useWatch("fullName", form);
  const previewUsername = Form.useWatch("username", form);
  const previewEmail = Form.useWatch("email", form);
  const previewRoleId = Form.useWatch("roleId", form);
  const currentFullName = previewFullName ?? defaultFormData.fullName;
  const currentUsername = previewUsername ?? defaultFormData.username;
  const currentEmail = previewEmail ?? defaultFormData.email;
  const displayName =
    currentFullName.trim() ||
    currentUsername.trim() ||
    t("userPage.formPreview.newUser");
  const displayContact =
    [currentUsername.trim(), currentEmail.trim()].filter(Boolean).join(" · ") ||
    t("userPage.formPreview.contactPlaceholder");
  const selectedRoleId =
    previewRoleId === undefined ? defaultFormData.roleId : previewRoleId;
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const displayRoleCode =
    getSystemRoleCode(selectedRole) ??
    getDeclaredSystemRoleCode(selectedRoleCode);
  const roleLabel =
    (displayRoleCode
      ? t(`userPage.roles.${displayRoleCode.toLowerCase()}`)
      : selectedRole?.roleName) ??
    roleSelection.find((option) => option.value === selectedRoleId)?.label ??
    t("userForm.rolePlaceholder");
  return (
    <AppDialog
      open
      onClose={onCancel}
      title={modalTitle}
      description={t(
        isUpdate
          ? "userPage.dialog.updateDescription"
          : "userPage.dialog.createDescription",
      )}
      icon={isUpdate ? <UserRoundPen size={24} /> : <UserRoundPlus size={24} />}
      tone="primary"
      width="min(880px, calc(100vw - 32px))"
      busy={isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t("common.back")}
          </Button>
          {!isView && (
            <Button
              variant="contained"
              color="primary"
              size="medium"
              htmlType="submit"
              form="identity-user-form"
              className="min-w-28"
              loading={isSaving}
              disabled={isSaving}
            >
              {isUpdate ? t("common.update") : t("common.saveUser")}
            </Button>
          )}
        </div>
      }
    >
      <Form
        id="identity-user-form"
        autoComplete="off"
        form={form}
        initialValues={defaultFormData}
        onValuesChange={handleFormValuesChange}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <UserIdentityCard
            name={displayName}
            secondaryText={displayContact}
            avatarUrl={initialData?.profile.avatarUrl}
            roleLabel={roleLabel}
            statusLabel={t(
              initialData?.isLocked
                ? "userPage.status.locked"
                : "userPage.status.active",
            )}
            isLocked={initialData?.isLocked ?? false}
          />
          <UserFormFields
            isView={isView}
            isUpdate={isUpdate}
            canViewRoles={canViewRoles}
            roleSelection={roleSelection}
            selectedRoleCode={selectedRoleCode}
            dateOfBirthRules={dateOfBirthRules}
            passwordRules={passwordRules}
            roleRules={roleRules}
            roleRequired={roleRequired}
          />
        </div>
      </Form>
    </AppDialog>
  );
}
