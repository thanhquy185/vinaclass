import { AlertTriangle, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Role } from "@/shared/types";
import { AppDialog, Button } from "@/shared/components/ui";
import type {
  User,
  UserCreate,
  UserUpdate,
} from "@/features/identity/types/identity";
import type { UserFormMode } from "@/features/identity/types/userForm";
import { UserForm } from "@/features/identity/components/UserForm";
import { UserIdentityCard } from "@/features/identity/components/UserIdentityCard";
import { UserInfoItem } from "@/features/identity/components/UserInfoItem";
import { UserInfoSection } from "@/features/identity/components/UserInfoSection";
import { UserConfirmationSummary } from "@/features/identity/components/UserConfirmationSummary";
import { formatIdentityDate } from "@/features/identity/utils/userDisplay";
import { getUserSystemRoleCode } from "@/shared/utils/role";

export type UserDialogMode = UserFormMode | "delete";

interface UserDialogProps {
  mode: UserDialogMode;
  user: User | null;
  roles: Role[];
  canViewRoles: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: (userId: number) => void | Promise<void>;
  onSaveCreate: (data: UserCreate) => void;
  onSaveUpdate: (id: number, data: UserUpdate) => void;
}

function UserDetailsDialog({
  user,
  roles,
  onClose,
}: {
  user: User;
  roles: Role[];
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation("common");
  const roleCode = getUserSystemRoleCode(user, roles);
  const assignedRole = roles.find((role) => role.id === user.roleId);
  const roleLabel =
    (roleCode
      ? t(`userPage.roles.${roleCode.toLowerCase()}`)
      : assignedRole?.roleName) ?? t("userPage.roles.assigned");

  return (
    <AppDialog
      open
      onClose={onClose}
      title={t("userPage.details.title")}
      description={t("userPage.details.description")}
      icon={<Eye size={21} />}
      tone="primary"
      width="min(780px, calc(100vw - 32px))"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" size="medium" onClick={onClose}>
            {t("common.back")}
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
        <UserInfoSection title={t("userPage.formSections.credentials")}>
          <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <UserInfoItem
              label={t("userForm.username")}
              value={user.username}
            />
            <UserInfoItem label={t("userForm.email")} value={user.email} />
          </dl>
        </UserInfoSection>
        <UserInfoSection title={t("userPage.details.personalInformation")}>
          <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <UserInfoItem
              label={t("userForm.fullName")}
              value={user.profile.fullName}
            />
            <UserInfoItem
              label={t("userForm.phone")}
              value={user.profile.phone ?? "—"}
            />
            <UserInfoItem
              label={t("userForm.gender")}
              value={t(
                user.profile.isFemale ? "userForm.female" : "userForm.male"
              )}
            />
            <UserInfoItem
              label={t("userForm.dateOfBirth")}
              value={formatIdentityDate(
                user.profile.dateOfBirth,
                i18n.language
              )}
            />
          </dl>
        </UserInfoSection>
        {roleCode === "TEACHER" && user.teacherProfile && (
          <UserInfoSection title={t("userForm.teacherProfile.title")}>
            <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <UserInfoItem
                label={t("userForm.teacherProfile.teacherCode")}
                value={user.teacherProfile.teacherCode ?? "—"}
              />
              <UserInfoItem
                label={t("userForm.teacherProfile.departmentName")}
                value={user.teacherProfile.departmentName ?? "—"}
              />
              <UserInfoItem
                label={t("userForm.teacherProfile.academicTitle")}
                value={user.teacherProfile.academicTitle ?? "—"}
              />
            </dl>
          </UserInfoSection>
        )}
        {roleCode === "STUDENT" && user.studentProfile && (
          <UserInfoSection title={t("userForm.studentProfile.title")}>
            <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <UserInfoItem
                label={t("userForm.studentProfile.studentCode")}
                value={user.studentProfile.studentCode ?? "—"}
              />
              <UserInfoItem
                label={t("userForm.studentProfile.programName")}
                value={user.studentProfile.programName ?? "—"}
              />
              <UserInfoItem
                label={t("userForm.studentProfile.cohort")}
                value={user.studentProfile.cohort ?? "—"}
              />
            </dl>
          </UserInfoSection>
        )}
        <UserInfoSection title={t("userPage.details.userActivity")}>
          <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <UserInfoItem
              label={t("userPage.table.joinDate")}
              value={formatIdentityDate(user.createdAt, i18n.language, true)}
            />
            <UserInfoItem
              label={t("userPage.details.lastLogin")}
              value={formatIdentityDate(user.lastLogin, i18n.language, true)}
            />
          </dl>
        </UserInfoSection>
      </div>
    </AppDialog>
  );
}

function UserDeleteDialog({
  user,
  isDeleting,
  onClose,
  onDelete,
}: {
  user: User;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: (userId: number) => void | Promise<void>;
}) {
  const { t } = useTranslation("common");

  return (
    <AppDialog
      open
      onClose={onClose}
      title={t("userPage.confirmDeleteTitle")}
      description={t("userPage.dialog.deleteDialogDescription")}
      icon={<AlertTriangle size={21} />}
      tone="danger"
      width={520}
      busy={isDeleting}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="medium"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={() => void onDelete(user.id)}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {t("tableActions.remove")}
          </Button>
        </div>
      }
    >
      <UserConfirmationSummary user={user}>
        <p className="mt-1 text-sm leading-5 text-text-secondary">
          {t("userPage.confirmDelete", { username: user.username })}
        </p>
      </UserConfirmationSummary>
    </AppDialog>
  );
}

export function UserDialog(props: UserDialogProps) {
  const { mode, user, ...rest } = props;

  if (mode === "view") {
    return user ? (
      <UserDetailsDialog
        user={user}
        roles={rest.roles}
        onClose={rest.onClose}
      />
    ) : null;
  }

  if (mode === "delete") {
    return user ? (
      <UserDeleteDialog
        user={user}
        isDeleting={rest.isDeleting}
        onClose={rest.onClose}
        onDelete={rest.onDelete}
      />
    ) : null;
  }

  return (
    <UserForm
      initialData={user}
      onSaveCreate={rest.onSaveCreate}
      onSaveUpdate={rest.onSaveUpdate}
      onCancel={rest.onClose}
      mode={mode}
      isSaving={rest.isSaving}
      canViewRoles={rest.canViewRoles}
      roles={rest.roles}
    />
  );
}
