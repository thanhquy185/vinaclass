import { useState } from "react";
import { Mail, Phone, Camera, MapPin, Globe, CheckCircle2 } from "lucide-react";
import { TextField } from "@/components/atomic/molecules/TextField/TextField";
import { Button } from "@/components/atomic/atoms";
import Tabs from "@/components/atomic/molecules/Tabs/Tabs";
import { useChangePassword } from "@/hooks/useUser";
import { useAuthStore } from "@/stores/auth.store";
import { getDefaultAvatar } from "@/utils";
import type { ChangePassForm, ErrorResponse } from "@/types";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";

// --- Interfaces ---

// --- Main Component ---
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  const { user } = useAuthStore();
  const { changePassword: submitChangePassword } = useChangePassword();

  const defaultChangePassForm: ChangePassForm = {
    currentPassword: "",
    newPassword: "",
    newPasswordConfirmation: "",
  };
  const [formChangePass, setFormChangePass] = useState<ChangePassForm>(
    defaultChangePassForm
  );

  // Mock data mapping đúng interface TaiKhoan
  // const user: TaiKhoan = {
  //   id: 1,
  //   ma: "NDT15_HMANH",
  //   username: "manh.nguyenhung",
  //   hoTen: "Nguyễn Hùng Mạnh",
  //   email: "manh.nguyen@ndt15.vn",
  //   nhomQuyenId: 1,
  //   sdt: "0987 654 321",
  //   ngaySinh: "17/04/2000",
  //   laGioiTinhNu: false,
  //   ggid: null,
  //   urlAvatar: null,
  //   isStudent: true,
  //   isLocked: false,
  //   isDeleted: false,
  //   lastLogin: "2026-04-03",
  //   created_at: "2025-12-01",
  //   updated_at: "2026-04-01",
  // };

  const { t } = useTranslation();

  const changePassword = async () => {
    console.log("change", formChangePass);
    if (!user) {
      console.log(t("profile.errors.userNotSet"));
      return;
    }

    if (!validate()) return;
    try {
      await submitChangePassword({ userId: user.id, data: formChangePass });
      alert(t("message.success.update"));
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response?.data?.errors;

        if (errors?.currentPassword?.length) {
          alert(t("profile.validation.currentPasswordMismatch"));
          return;
        }

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          alert(firstError[0]);
        }
      } else {
        alert(t("message.error.update"));
      }
    }
  };

  const validate = (): boolean => {
    if (
      !formChangePass.newPassword ||
      formChangePass.newPassword.trim() === ""
    ) {
      alert(t("profile.validation.passwordRequired"));
      return false;
    }

    if (formChangePass.newPassword.length < 6) {
      alert(t("profile.validation.passwordMinLength"));
      return false;
    }

    if (!/[a-zA-Z]/.test(formChangePass.newPassword)) {
      alert(t("profile.validation.passwordLetterRequired"));
      return false;
    }

    if (!/[0-9]/.test(formChangePass.newPassword)) {
      alert(t("profile.validation.passwordNumberRequired"));
      return false;
    }

    if (
      !/[A-Z]/.test(formChangePass.newPassword) ||
      !/[a-z]/.test(formChangePass.newPassword)
    ) {
      alert(t("profile.validation.passwordCaseRequired"));
      return false;
    }

    if (formChangePass.newPasswordConfirmation !== formChangePass.newPassword) {
      alert(t("profile.validation.passwordConfirmMismatch"));
      return false;
    }

    if (formChangePass.newPassword === formChangePass.currentPassword) {
      alert(t("profile.validation.passwordDifferent"));
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen w-full bg-background-body">
      {/* HEADER SECTION */}
      <div className="w-full bg-background-body-background shadow-sm">
        <div className="mx-auto w-full max-w-5xl">
          {/* Profile Bar */}
          <div className="flex flex-col items-center px-6 md:flex-row md:gap-6">
            <div className="relative py-4">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background-paper bg-grey-grey-200 shadow-md">
                <img
                  src={getDefaultAvatar(user?.fullName || "User")}
                  alt={t("profile.avatarAlt")}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button className="absolute bottom-2 right-2 rounded-full border border-other-outlined-border bg-background-body-background p-2 shadow hover:bg-action-hover">
                <Camera size={18} className="text-text-primary" />
              </Button>
            </div>
            <div className="mt-4 flex-1 text-center md:mb-4 md:text-left">
              <h1 className="text-h6 font-bold uppercase text-text-primary">
                {user?.fullName}
              </h1>
              <p className="text-body-2 text-text-secondary">
                @{user?.username}
              </p>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onChange={(item) => setActiveTab(item as "info" | "password")}
            tabs={[
              { value: "info", label: t("profile.tabs.info") },
              { value: "password", label: t("profile.tabs.password") },
            ]}
          />
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-start gap-6 px-6 pb-20 md:flex-row">
        {/* Sidebar trái - Giới thiệu */}
        <div className="w-full shrink-0 md:w-[320px]">
          <div className="rounded-xl border border-other-outlined-border bg-background-paper p-6 shadow-sm">
            <h3 className="text-h6 mb-5 font-bold text-text-primary">
              {t("profile.about.title")}
            </h3>
            <div className="space-y-4">
              <div className="text-body-2 flex items-center gap-3 text-text-secondary">
                <Mail size={18} className="text-text-disabled" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="text-body-2 flex items-center gap-3 text-text-secondary">
                <Phone size={18} className="text-text-disabled" />
                <span>{user?.phone}</span>
              </div>
              <div className="text-body-2 flex items-center gap-3 text-text-secondary">
                <MapPin size={18} className="text-text-disabled" />
                <span>{t("profile.about.location")}</span>
              </div>
              <div className="text-body-2 flex items-center gap-3 text-text-secondary">
                <Globe size={18} className="text-text-disabled" />
                <a
                  href="https://facebook.com/manh"
                  className="text-alert-info-content hover:underline"
                >
                  {t("profile.about.socialLink")}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content phải - Chi tiết */}
        <div className="w-full flex-1">
          <div className="rounded-xl border border-other-outlined-border bg-background-body-background p-8 shadow-sm">
            {activeTab === "info" ? (
              <div className="min-w-[600px] space-y-4 duration-500 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-other-divider pb-5">
                  <h2 className="text-h6 font-bold text-text-primary">
                    {t("profile.details.title")}
                  </h2>
                  <CheckCircle2
                    className="text-alert-success-content"
                    size={24}
                  />
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <TextField
                    label={t("profile.details.fullName")}
                    value={user?.fullName}
                    readOnly
                  />
                  <TextField
                    label={t("profile.details.identityCode")}
                    value={user?.code}
                    readOnly
                  />
                  <TextField
                    label={t("profile.details.contactEmail")}
                    value={user?.email}
                    readOnly
                  />
                  <TextField
                    label={t("profile.details.phone")}
                    value={user?.phone}
                    readOnly
                  />
                  <TextField
                    label={t("profile.details.birthDate")}
                    value={user?.dateOfBirth}
                    readOnly
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-body-2-semibold text-text-secondary">
                      {t("profile.details.gender")}
                    </label>
                    <div className="text-body-2 py-2 font-medium text-text-primary">
                      {user?.isFemale
                        ? t("profile.details.genderFemale")
                        : t("profile.details.genderMale")}
                    </div>
                  </div>

                  <div className="mt-2 rounded-lg border border-success-background bg-success-background p-3 md:col-span-2">
                    <p className="text-caption font-bold uppercase tracking-widest text-alert-success-content">
                      {t("profile.systemStatus.title")}
                    </p>
                    <p className="text-body-2 mt-1.5 leading-relaxed text-text-primary">
                      {t("profile.systemStatus.description", {
                        system: "NDT15",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Phần đổi mật khẩu giữ nguyên logic của bạn */
              <div className="min-w-[600px] space-y-4 duration-500 animate-in slide-in-from-right-4">
                <div className="border-b border-other-divider pb-4">
                  <h2 className="text-h6 font-bold text-text-primary">
                    {t("profile.password.title")}
                  </h2>
                  <p className="text-helper-text mt-1 text-text-secondary">
                    {t("profile.password.subtitle")}
                  </p>
                </div>
                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <TextField
                    value={formChangePass.currentPassword}
                    onChange={(e) =>
                      setFormChangePass((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    type="password"
                    label={t("profile.password.current")}
                    placeholder="••••••••"
                  />
                  <div className="h-px w-full bg-other-divider"></div>
                  <TextField
                    value={formChangePass.newPassword}
                    onChange={(e) =>
                      setFormChangePass((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    type="password"
                    label={t("profile.password.new")}
                    placeholder={t("profile.password.newPlaceholder")}
                  />
                  <TextField
                    value={formChangePass.newPasswordConfirmation}
                    onChange={(e) =>
                      setFormChangePass((prev) => ({
                        ...prev,
                        newPasswordConfirmation: e.target.value,
                      }))
                    }
                    type="password"
                    label={t("profile.password.confirm")}
                    placeholder={t("profile.password.confirmPlaceholder")}
                  />
                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      className="font-bold"
                      onClick={() => changePassword()}
                    >
                      {t("profile.password.update")}
                    </Button>
                    <Button
                      variant="outline"
                      color="standard"
                      size="large"
                      className="font-bold"
                    >
                      {t("profile.password.cancel")}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
