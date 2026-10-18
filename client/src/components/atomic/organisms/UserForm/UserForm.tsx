import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/components/atomic/atoms";
import { TextField } from "@/components/atomic/molecules/TextField/TextField";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import type { User, UserBase, UserCreate, UserUpdate } from "@/types";
import { Overlay } from "../../molecules/Overlay/Overlay";
import Tabs from "../../molecules/Tabs/Tabs";
import { RadioGroup } from "../../molecules/RadioGroup/RadioGroup";
import { Toggle } from "../../atoms/Toggle/Toggle";
import { useRole } from "@/hooks/useRole";
import { UserValidate, type UserError } from "@/validate/user.validate";

interface UserFormProps {
  initialData?: User | null;
  onSaveCreate: (data: UserCreate) => void;
  onSaveUpdate: (id: number, data: UserUpdate) => void;
  onResetPassword: (id: number, password: string) => void;
  onCancel: () => void;
  mode: string;
}

interface selectionCbxRole {
  label: string;
  value: number;
}

export function UserForm({
  initialData,
  onSaveCreate,
  onSaveUpdate,
  onResetPassword,
  onCancel,
  mode,
}: UserFormProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("manual");

  const isView = mode === "view";
  const isUpdate = mode === "update";

  const tabs = isUpdate
    ? [{ value: "manual", label: t("userForm.edit") }]
    : isView
      ? [{ value: "manual", label: t("userForm.detail") }]
      : [
          { value: "manual", label: t("userForm.addManually") },
          { value: "file", label: t("userForm.addFromFile") },
        ];

  const { roles } = useRole();
  const roleSelection: selectionCbxRole[] = roles.map((role) => ({
    label: role.roleName,
    value: role.id,
  }));

  const defaultFormData: UserBase = initialData
    ? {
        username: initialData.username,
        email: initialData.email,
        fullName: initialData.fullName,
        isFemale: initialData.isFemale,
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
          : "",
        roleId: initialData.roleId,
        isLocked: initialData.isLocked,
        isStudent: initialData.isStudent,
      }
    : {
        username: "",
        email: "",
        fullName: "",
        isFemale: false,
        dateOfBirth: "",
        roleId: null,
        isLocked: false,
        isStudent: true,
      };

  const [formData, setFormData] = useState<UserBase>(defaultFormData);
  const [passwordField, setPasswordField] = useState("");

  const handleChange = <K extends keyof UserBase>(
    field: K,
    value: UserBase[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeIsStudent = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isStudent: value,
      roleId: value ? null : prev.roleId,
    }));
  };

  const [errors, setErrors] = useState<UserError>({});

  const translateErrors = (input: UserError): UserError => {
    return Object.entries(input).reduce((acc, [key, value]) => {
      if (!value) return acc;
      acc[key as keyof UserError] = t(value);
      return acc;
    }, {} as UserError);
  };

  // Xử lý submit form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isView) return;
    if (isUpdate) {
      if (initialData) {
        const errors = UserValidate.update(formData);

        if (Object.keys(errors).length > 0) {
          setErrors(translateErrors(errors));
          return;
        }
        onSaveUpdate(initialData.id, formData as UserUpdate);
      }
    } else {
      const data: UserCreate = { ...formData, password: passwordField };
      const errors = UserValidate.create(data);

      if (Object.keys(errors).length > 0) {
        setErrors(translateErrors(errors));
        return;
      }

      onSaveCreate(data);
    }
  };

  return (
    <Overlay onClose={onCancel}>
      <div className="flex w-[600px] flex-col gap-3 rounded-lg bg-background-paper pb-2 shadow-2xl">
        <Tabs
          value={selectedTab}
          onChange={setSelectedTab}
          childClassName="flex-1"
          tabs={tabs}
        />

        {selectedTab === "manual" ? (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Form Body */}
            <div className="flex max-h-[70vh] flex-col gap-5 overflow-auto px-8 py-4">
              <TextField
                label={t("userForm.username")}
                placeholder={t("userForm.usernamePlaceholder")}
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={isView || isUpdate}
                error={errors.username}
              />

              <TextField
                label={t("userForm.email")}
                type="email"
                placeholder={t("userForm.emailPlaceholder")}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isView}
                error={errors.email}
              />

              <TextField
                label={t("userForm.fullName")}
                placeholder={t("userForm.fullNamePlaceholder")}
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                disabled={isView}
                error={errors.fullName}
              />

              <div className="flex items-center gap-4">
                <span className="text-body-2 font-medium text-text-primary">
                  {t("userForm.gender")}
                </span>
                <RadioGroup
                  name="gender"
                  options={[
                    { label: t("userForm.male"), value: false },
                    { label: t("userForm.female"), value: true },
                  ]}
                  value={formData.isFemale}
                  onChange={(value) => handleChange("isFemale", value)}
                  disabled={isView}
                />
              </div>

              <TextField
                label={t("userForm.dateOfBirth")}
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                disabled={isView}
                error={errors.dateOfBirth}
              />

              {!formData.isStudent && (
                <div className="flex flex-col gap-1">
                  <span className="text-body-2 font-medium text-text-primary">
                    {t("userForm.permissionGroup")}
                  </span>
                  <SelectField
                    classname="w-full"
                    placeholder={t("userForm.permissionGroupPlaceholder")}
                    options={roleSelection}
                    defaultIndex={roleSelection.findIndex(
                      (r) => r.value === formData.roleId
                    )}
                    onSelect={(val) => handleChange("roleId", Number(val))}
                    disabled={isView}
                  />
                </div>
              )}

              {!isView && (
                <TextField
                  label={
                    isUpdate
                      ? t("userForm.newPasswordPrompt")
                      : t("userForm.password")
                  }
                  type="password"
                  placeholder={t("userForm.passwordPlaceholder")}
                  value={passwordField}
                  onChange={(e) => setPasswordField(e.target.value)}
                  error={errors.password}
                />
              )}

              <div className="mt-2 flex items-center justify-between border-t border-other-outlined-border py-2 pt-4">
                <Toggle
                  label={t("userForm.lockAccount")}
                  checked={formData.isLocked}
                  onChange={(e) => handleChange("isLocked", e.target.checked)}
                  disabled={isView}
                />
                <Toggle
                  label={t("userForm.isStudent")}
                  checked={formData.isStudent}
                  onChange={(e) => handleChangeIsStudent(e.target.checked)}
                  disabled={isView}
                />
              </div>

              {isUpdate && initialData && !isView && (
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant={"outline"}
                    color="primary"
                    onClick={() =>
                      onResetPassword(initialData.id, passwordField)
                    }
                  >
                    {t("userForm.quickResetPassword")}
                  </Button>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-2 border-t border-other-outlined-border px-8 py-4">
              <Button
                type="button"
                variant={"outline"}
                color={"standard"}
                onClick={onCancel}
              >
                {t("common.back")}
              </Button>

              {!isView && (
                <Button type="submit" variant={"contained"} color={"primary"}>
                  {isUpdate ? t("common.update") : t("common.saveAccount")}
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 px-6">
            <Icon name="upload" size={48} className="text-text-disabled" />
            <p className="text-text-secondary">
              {t("userForm.dragDropPrompt")}
            </p>
            <Button type="button" variant="outline" color="primary">
              {t("userForm.selectExcelFile")}
            </Button>
          </div>
        )}
      </div>
    </Overlay>
  );
}
