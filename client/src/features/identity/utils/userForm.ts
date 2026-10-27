import type { Role } from "@/shared/types";
import type { User, UserBase } from "@/features/identity/types/identity";
import { getSystemRoleCode } from "@/shared/utils/role";

type UserProfileFields = Pick<UserBase, "teacherProfile" | "studentProfile">;

export function getUserFormDefaultValues(initialData?: User | null): UserBase {
  if (!initialData) {
    return {
      username: "",
      email: "",
      fullName: "",
      isFemale: false,
      dateOfBirth: "",
      roleId: null,
      isLocked: false,
      phone: "",
      teacherProfile: {},
      studentProfile: {},
    };
  }

  return {
    username: initialData.username,
    email: initialData.email,
    fullName: initialData.profile.fullName,
    isFemale: initialData.profile.isFemale,
    dateOfBirth: initialData.profile.dateOfBirth
      ? new Date(initialData.profile.dateOfBirth).toISOString().split("T")[0]
      : "",
    roleId: initialData.roleId,
    isLocked: initialData.isLocked,
    phone: initialData.profile.phone,
    teacherProfile: initialData.teacherProfile ?? {},
    studentProfile: initialData.studentProfile ?? {},
  };
}

export function getUserFormRoleCode(
  roleId: number | null,
  roles: Role[],
  initialData?: User | null
) {
  const assignedRoleCode = getSystemRoleCode(
    roles.find((role) => role.id === roleId)
  );
  if (assignedRoleCode) return assignedRoleCode;

  const initialRoleId = initialData?.roleId ?? null;
  if (roleId !== initialRoleId) return null;

  return initialData?.roleCode ?? null;
}

export function getUserRoleProfilePayload(
  values: UserBase,
  roles: Role[],
  initialData: User | null | undefined,
  canViewRoles: boolean,
  isUpdate: boolean
): UserProfileFields {
  if (!canViewRoles && isUpdate) {
    return {
      teacherProfile: values.teacherProfile,
      studentProfile: values.studentProfile,
    };
  }

  const roleCode = getUserFormRoleCode(values.roleId, roles, initialData);

  if (roleCode === "TEACHER") {
    return {
      teacherProfile: values.teacherProfile,
      studentProfile: undefined,
    };
  }
  if (roleCode === "STUDENT") {
    return {
      teacherProfile: undefined,
      studentProfile: values.studentProfile,
    };
  }

  return { teacherProfile: undefined, studentProfile: undefined };
}
