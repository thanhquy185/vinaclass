import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import type { ExamAttempt } from "@/shared/types/assessments";

export interface User {
  id: number;
  code?: string | null;
  username: string;
  email: string;
  roleId: number | null;
  roleCode?: string | null;
  profile: UserProfileData;
  ggid: string | null;
  isLocked: boolean;
  isDeleted: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  courseGroups?: CourseGroup[];
  teacherProfile?: TeacherProfileData | null;
  studentProfile?: StudentProfileData | null;
}

export interface UserProfileData {
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  isFemale: boolean;
  avatarUrl: string | null;
}

export interface TeacherProfileData {
  teacherCode?: string | null;
  departmentName?: string | null;
  academicTitle?: string | null;
}

export interface StudentProfileData {
  studentCode?: string | null;
  programName?: string | null;
  cohort?: string | null;
}

export interface UserBase {
  fullName: string;
  email: string;
  roleId: number | null;
  phone?: string | null;
  username: string;
  dateOfBirth: string | null;
  isFemale: boolean;
  ggid?: string | null;
  avatarUrl?: string | null;
  isLocked: boolean;
  teacherProfile?: TeacherProfileData | null;
  studentProfile?: StudentProfileData | null;
}

export interface UserCreate extends UserBase {
  password: string;
}

export type UserUpdate = Partial<UserBase>;

export interface OwnProfileUpdate {
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  isFemale: boolean;
}

export interface UserResponse extends User {}

export interface UserResetPass {
  newPassword: string;
  newPasswordConfirmation?: string;
}

export interface StudentRecord {
  id: number;
  stt: number;
  fullName: string;
  email: string;
  studentCode: string;
  gender: string;
  dateOfBirth: string;
  avatarUrl: string;
}

export interface StudentResult extends User {
  courseGroup?: CourseGroup;
  examAttempt?: ExamAttempt;
  isAverage?: boolean;
}
