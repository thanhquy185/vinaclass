import { Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import Tabs from "@/shared/components/ui/Tabs/Tabs";
import ProfileDetailsForm from "@/features/identity/components/ProfileDetailsForm";
import ChangePasswordForm from "@/features/identity/components/ChangePasswordForm";
import { useProfilePageController } from "@/features/identity/hooks/useProfilePageController";
import { getDefaultAvatar } from "@/shared/utils/avatar";

export default function ProfilePage() {
  const { t } = useTranslation();
  const {
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
  } = useProfilePageController();

  return (
    <div className="min-h-screen w-full bg-background-body">
      <div className="w-full bg-background-body-background shadow-sm">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center px-6 md:flex-row md:gap-6">
            <div className="relative py-4">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background-paper bg-grey-grey-200 shadow-md">
                <img
                  src={getDefaultAvatar(user?.profile.fullName || "User")}
                  alt={t("profile.avatarAlt")}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="mt-4 flex-1 text-center md:mb-4 md:text-left">
              <h1 className="text-h6 font-bold uppercase text-text-primary">
                {user?.profile.fullName}
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

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-start gap-6 px-6 pb-20 md:flex-row">
        <div className="w-full shrink-0 md:w-[320px]">
          <div className="rounded-xl border border-other-outlined-border bg-background-paper p-6 shadow-sm">
            <h3 className="text-h6 mb-5 font-bold text-text-primary">
              {t("profile.about.title")}
            </h3>
            <div className="space-y-4">
              <div className="text-body-2 flex items-center gap-3 text-text-secondary">
                <Mail size={18} className="text-text-disabled" />
                <span className="truncate">{user?.email || "—"}</span>
              </div>
              <div className="text-body-2 flex items-center gap-3 text-text-secondary">
                <Phone size={18} className="text-text-disabled" />
                <span>{user?.profile.phone || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex-1">
          <div className="rounded-xl border border-other-outlined-border bg-background-body-background p-8 shadow-sm">
            {activeTab === "info" ? (
              <ProfileDetailsForm
                user={user}
                form={profileForm}
                isEditing={isEditingProfile}
                isSaving={isUpdatingOwnProfile}
                onEdit={startProfileEdit}
                onCancel={cancelProfileEdit}
                onSubmit={updateOwnProfile}
              />
            ) : (
              <ChangePasswordForm
                form={passwordForm}
                isChanging={isChanging}
                onSubmit={changePassword}
                onCancel={resetPasswordForm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
