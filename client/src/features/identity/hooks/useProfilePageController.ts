import { Form } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useChangePassword,
  useUpdateOwnProfile,
} from "@/features/identity/hooks/useUserMutations";
import type { ProfileFormValues } from "@/features/identity/types/profileForm";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorDetails, hasApiFieldError } from "@/shared/utils/apiError";
import type { ChangePassForm } from "@/shared/types";

type ProfileTab = "info" | "password";

export function useProfilePageController() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { user } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { changePassword: submitChangePassword, isChanging } =
    useChangePassword();
  const { updateOwnProfile: submitProfileUpdate, isUpdatingOwnProfile } =
    useUpdateOwnProfile();
  const showToast = useToastStore((state) => state.showToast);
  const [passwordForm] = Form.useForm<ChangePassForm>();
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const { t } = useTranslation();

  const resetPasswordForm = () => passwordForm.resetFields();

  const startProfileEdit = () => {
    if (!user) return;

    profileForm.setFieldsValue({
      fullName: user.profile.fullName,
      phone: user.profile.phone ?? "",
      dateOfBirth: user.profile.dateOfBirth ?? "",
      isFemale: user.profile.isFemale,
    });
    setIsEditingProfile(true);
  };

  const cancelProfileEdit = () => {
    profileForm.resetFields();
    setIsEditingProfile(false);
  };

  const updateOwnProfile = async (values: ProfileFormValues) => {
    try {
      await submitProfileUpdate({
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || null,
        dateOfBirth: values.dateOfBirth || null,
        isFemale: values.isFemale,
      });
      setIsEditingProfile(false);
      showToast(t("profile.updateSuccess"), "success");
    } catch {
      showToast(t("profile.updateError"), "error");
    }
  };

  const changePassword = async (formData: ChangePassForm) => {
    if (!user) return;

    try {
      await submitChangePassword({ userId: user.id, data: formData });
      resetPasswordForm();
      showToast(t("profile.password.updateSuccess"), "success");
      logout();
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      const details = getApiErrorDetails(error);
      if (
        details.status === 422 &&
        hasApiFieldError(details.errors, "currentPassword")
      ) {
        passwordForm.setFields([
          {
            name: "currentPassword",
            errors: [t("profile.validation.currentPasswordMismatch")],
          },
        ]);
        return;
      }

      showToast(t("message.error.update"), "error");
    }
  };

  return {
    user,
    activeTab,
    setActiveTab,
    isEditingProfile,
    isChanging,
    isUpdatingOwnProfile,
    passwordForm,
    profileForm,
    startProfileEdit,
    cancelProfileEdit,
    updateOwnProfile,
    changePassword,
    resetPasswordForm,
  };
}
