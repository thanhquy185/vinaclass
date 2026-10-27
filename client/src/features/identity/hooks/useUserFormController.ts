import { useState } from "react";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import type { Role } from "@/shared/types";
import type {
  User,
  UserBase,
  UserCreate,
  UserUpdate,
} from "@/features/identity/types/identity";
import {
  getUserFormDefaultValues,
  getUserFormRoleCode,
  getUserRoleProfilePayload,
} from "@/features/identity/utils/userForm";
import {
  type UserFormMode,
  type UserFormValues,
} from "@/features/identity/types/userForm";
import { getSystemRoleCode } from "@/shared/utils/role";
import { useUserFormValidation } from "@/features/identity/hooks/useUserFormValidation";

interface UseUserFormControllerOptions {
  initialData?: User | null;
  onSaveCreate: (data: UserCreate) => void;
  onSaveUpdate: (id: number, data: UserUpdate) => void;
  mode: UserFormMode;
  canViewRoles: boolean;
  roles: Role[];
}

export function useUserFormController({
  initialData,
  onSaveCreate,
  onSaveUpdate,
  mode,
  canViewRoles,
  roles,
}: UseUserFormControllerOptions) {
  const { t } = useTranslation();
  const [form] = Form.useForm<UserFormValues>();
  const isView = mode === "view";
  const isUpdate = mode === "update";

  const roleSelection = roles.flatMap((role) => {
    if (role.isDeleted) return [];

    const code = getSystemRoleCode(role);

    return [
      {
        label: code
          ? t(`userPage.roles.${code.toLowerCase()}`)
          : role.roleName,
        value: role.id,
      },
    ];
  });
  if (
    initialData?.roleId != null &&
    !roleSelection.some((option) => option.value === initialData.roleId)
  ) {
    roleSelection.push({
      label: t("userForm.currentRoleUnavailable"),
      value: initialData.roleId,
    });
  }

  const defaultFormData = getUserFormDefaultValues(initialData);

  const [formData, setFormData] = useState<UserBase>(defaultFormData);
  const selectedRoleCode = getUserFormRoleCode(
    formData.roleId,
    roles,
    initialData,
  );
  const { dateOfBirthRules, passwordRules, roleRules, roleRequired } =
    useUserFormValidation({
      isUpdate,
      isLegacyStudent:
        initialData?.roleId == null && initialData?.roleCode === "STUDENT",
    });

  const handleFormValuesChange = (
    _changedValues: Partial<UserFormValues>,
    values: UserFormValues,
  ) => {
    setFormData((previous) => {
      const nextValues = {
        ...previous,
        ...values,
        teacherProfile: {
          ...previous.teacherProfile,
          ...values.teacherProfile,
        },
        studentProfile: {
          ...previous.studentProfile,
          ...values.studentProfile,
        },
      };

      return nextValues;
    });
  };

  const handleSubmit = (values: UserFormValues) => {
    if (isView) return;

    const submittedValues: UserFormValues = {
      ...formData,
      ...values,
      teacherProfile: {
        ...formData.teacherProfile,
        ...values.teacherProfile,
      },
      studentProfile: {
        ...formData.studentProfile,
        ...values.studentProfile,
      },
    };
    if (isUpdate) {
      if (initialData) {
        const updateData = {
          ...submittedValues,
          ...getUserRoleProfilePayload(
            submittedValues,
            roles,
            initialData,
            canViewRoles,
            isUpdate,
          ),
        } as UserUpdate;
        delete updateData.isLocked;
        onSaveUpdate(initialData.id, updateData);
      }
      return;
    }

    const data: UserCreate = {
      ...submittedValues,
      ...getUserRoleProfilePayload(
        submittedValues,
        roles,
        initialData,
        canViewRoles,
        isUpdate,
      ),
      isLocked: false,
      password: submittedValues.password ?? "",
    };
    onSaveCreate(data);
  };

  return {
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
  };
}
