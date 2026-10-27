import { useTranslation } from "react-i18next";
import type { User } from "@/features/identity/types/identity";
import { IdentityAvatar } from "@/shared/components/ui";

interface AssignmentTeacherIdentityProps {
  teacher: User;
  variant?: "option" | "selected";
}

export function AssignmentTeacherIdentity({
  teacher,
  variant = "option",
}: AssignmentTeacherIdentityProps) {
  const { t } = useTranslation();
  const isSelected = variant === "selected";
  const name = teacher.profile.fullName || teacher.username;
  const teacherCode = teacher.teacherProfile?.teacherCode ?? teacher.code;
  const academicTitle = teacher.teacherProfile?.academicTitle;
  const departmentName = teacher.teacherProfile?.departmentName;

  return (
    <div className={`flex min-w-0 items-center ${isSelected ? "gap-3" : "gap-2.5"}`}>
      <IdentityAvatar
        name={name}
        avatarUrl={teacher.profile.avatarUrl}
        size={isSelected ? "medium" : "small"}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {name}
        </p>
        <p className="truncate text-xs text-text-secondary">
          {[
            teacherCode
              ? `${t("userForm.teacherProfile.teacherCode")}: ${teacherCode}`
              : null,
            teacher.email,
          ]
            .filter(Boolean)
            .join(" · ") || teacher.username}
        </p>
        {(academicTitle || departmentName) && (
          <p className="truncate text-xs text-text-disabled">
            {[academicTitle, departmentName].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
