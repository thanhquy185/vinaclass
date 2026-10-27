import type { ChangePassForm } from "@/shared/types";
import type {
  OwnProfileUpdate,
  StudentProfileData,
  TeacherProfileData,
  User,
  UserCreate,
  UserResetPass,
  UserUpdate,
} from "@/features/identity/types/identity";

type RawProfile = {
  teacher_code?: string | null;
  teacherCode?: string | null;
  department_name?: string | null;
  departmentName?: string | null;
  academic_title?: string | null;
  academicTitle?: string | null;
  student_code?: string | null;
  studentCode?: string | null;
  program_name?: string | null;
  programName?: string | null;
  cohort?: string | null;
};

type RawPersonalProfile = {
  full_name?: string | null;
  fullName?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  dateOfBirth?: string | null;
  is_female?: boolean | number | string;
  isFemale?: boolean | number | string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
};

const toBoolean = (
  value: boolean | number | string | null | undefined
): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return false;

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

export type RawUser = {
  [key: string]: unknown;
  id?: number | string;
  code?: string | null;
  username?: string | null;
  full_name?: string | null;
  fullName?: string | null;
  email?: string | null;
  role_id?: number | string | null;
  roleId?: number | string | null;
  role_code?: string | null;
  roleCode?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  dateOfBirth?: string | null;
  is_female?: boolean | number | string;
  isFemale?: boolean | number | string;
  ggid?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  is_locked?: boolean | number | string;
  isLocked?: boolean | number | string;
  is_deleted?: boolean | number | string;
  isDeleted?: boolean | number | string;
  last_login?: string | null;
  lastLogin?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  profile?: RawPersonalProfile | null;
  teacher_profile?: RawProfile | null;
  teacherProfile?: RawProfile | null;
  student_profile?: RawProfile | null;
  studentProfile?: RawProfile | null;
};

const mapTeacherProfile = (
  value: RawProfile | null | undefined
): TeacherProfileData | null => {
  if (!value) return null;

  return {
    teacherCode: value.teacher_code ?? value.teacherCode ?? null,
    departmentName: value.department_name ?? value.departmentName ?? null,
    academicTitle: value.academic_title ?? value.academicTitle ?? null,
  };
};

const mapStudentProfile = (
  value: RawProfile | null | undefined
): StudentProfileData | null => {
  if (!value) return null;

  return {
    studentCode: value.student_code ?? value.studentCode ?? null,
    programName: value.program_name ?? value.programName ?? null,
    cohort: value.cohort ?? null,
  };
};

export const mapUser = (value: RawUser): User => {
  const roleId = value.role_id ?? value.roleId;
  const personalProfile: RawPersonalProfile = value.profile ?? {};
  const hasProfileField = (field: keyof RawPersonalProfile) =>
    Object.prototype.hasOwnProperty.call(personalProfile, field);
  const hasRoleCode =
    Object.prototype.hasOwnProperty.call(value, "role_code") ||
    Object.prototype.hasOwnProperty.call(value, "roleCode");
  const teacherProfile = mapTeacherProfile(
    value.teacher_profile ?? value.teacherProfile
  );
  const studentProfile = mapStudentProfile(
    value.student_profile ?? value.studentProfile
  );
  const userAttributes = { ...value };

  [
    "full_name",
    "fullName",
    "phone",
    "date_of_birth",
    "dateOfBirth",
    "is_female",
    "isFemale",
    "avatar_url",
    "avatarUrl",
    "profile",
    "teacher_profile",
    "teacherProfile",
    "student_profile",
    "studentProfile",
  ].forEach((key) => delete userAttributes[key]);

  return {
    ...userAttributes,
    id: Number(value.id),
    code:
      value.code ??
      teacherProfile?.teacherCode ??
      studentProfile?.studentCode ??
      null,
    username: value.username ?? "",
    profile: {
      fullName:
        personalProfile.full_name ??
        personalProfile.fullName ??
        value.full_name ??
        value.fullName ??
        "",
      phone: hasProfileField("phone")
        ? (personalProfile.phone ?? null)
        : (value.phone ?? null),
      dateOfBirth:
        hasProfileField("date_of_birth") || hasProfileField("dateOfBirth")
          ? (personalProfile.date_of_birth ??
            personalProfile.dateOfBirth ??
            null)
          : (value.date_of_birth ?? value.dateOfBirth ?? null),
      isFemale: toBoolean(
        hasProfileField("is_female") || hasProfileField("isFemale")
          ? (personalProfile.is_female ?? personalProfile.isFemale)
          : (value.is_female ?? value.isFemale)
      ),
      avatarUrl:
        hasProfileField("avatar_url") || hasProfileField("avatarUrl")
          ? (personalProfile.avatar_url ?? personalProfile.avatarUrl ?? null)
          : (value.avatar_url ?? value.avatarUrl ?? null),
    },
    email: value.email ?? "",
    roleId: roleId == null ? null : Number(roleId),
    roleCode: hasRoleCode
      ? (value.role_code ?? value.roleCode ?? null)
      : undefined,
    ggid: value.ggid ?? null,
    isLocked: toBoolean(value.is_locked ?? value.isLocked),
    isDeleted: toBoolean(value.is_deleted ?? value.isDeleted),
    lastLogin: value.last_login ?? value.lastLogin ?? "",
    createdAt: value.created_at ?? value.createdAt ?? "",
    updatedAt: value.updated_at ?? value.updatedAt ?? "",
    teacherProfile,
    studentProfile,
  } as User;
};

const mapRoleProfilePayload = (data: UserCreate | UserUpdate) => ({
  ...(data.teacherProfile && {
    teacher_profile: {
      teacher_code: data.teacherProfile.teacherCode,
      department_name: data.teacherProfile.departmentName,
      academic_title: data.teacherProfile.academicTitle,
    },
  }),
  ...(data.studentProfile && {
    student_profile: {
      student_code: data.studentProfile.studentCode,
      program_name: data.studentProfile.programName,
      cohort: data.studentProfile.cohort,
    },
  }),
});

const mapPersonalProfilePayload = (data: UserCreate) => ({
  full_name: data.fullName,
  phone: data.phone,
  date_of_birth: data.dateOfBirth,
  is_female: data.isFemale,
  avatar_url: data.avatarUrl,
});

export const mapUserCreatePayload = (data: UserCreate) => ({
  profile: mapPersonalProfilePayload(data),
  email: data.email,
  password: data.password,
  role_id: data.roleId,
  username: data.username,
  is_locked: data.isLocked,
  ggid: data.ggid,
  ...mapRoleProfilePayload(data),
});

export const mapUserUpdatePayload = (data: UserUpdate) => {
  const personalProfile = {
    ...(data.fullName !== undefined && { full_name: data.fullName }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.dateOfBirth !== undefined && {
      date_of_birth: data.dateOfBirth,
    }),
    ...(data.isFemale !== undefined && { is_female: data.isFemale }),
    ...(data.avatarUrl !== undefined && { avatar_url: data.avatarUrl }),
  };

  return {
    ...(Object.keys(personalProfile).length > 0 && {
      profile: personalProfile,
    }),
    ...(data.email !== undefined && { email: data.email }),
    ...(data.roleId !== undefined && { role_id: data.roleId }),
    ...(data.username !== undefined && { username: data.username }),
    ...(data.isLocked !== undefined && { is_locked: data.isLocked }),
    ...(data.ggid !== undefined && { ggid: data.ggid }),
    ...mapRoleProfilePayload(data),
  };
};

export const mapOwnProfilePayload = (data: OwnProfileUpdate) => ({
  profile: {
    full_name: data.fullName,
    phone: data.phone,
    date_of_birth: data.dateOfBirth,
    is_female: data.isFemale,
  },
});

export const mapPasswordChangePayload = (data: ChangePassForm) => ({
  current_password: data.currentPassword,
  new_password: data.newPassword,
  new_password_confirmation: data.newPasswordConfirmation,
});

export const mapPasswordResetPayload = (data: UserResetPass) => ({
  new_password: data.newPassword,
  new_password_confirmation: data.newPasswordConfirmation ?? data.newPassword,
});
