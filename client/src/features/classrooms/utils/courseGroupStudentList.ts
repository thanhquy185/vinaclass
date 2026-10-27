import type { TFunction } from "i18next";
import type { StudentRecord, User } from "@/shared/types";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

export type StudentSearchCriterion = "fullName" | "studentCode" | "email";

export function mapUserToStudentRecord(
  user: User,
  index: number,
  translate: TFunction
): StudentRecord {
  return {
    id: user.id,
    stt: index + 1,
    fullName: user.profile.fullName,
    email: user.email,
    studentCode: user.studentProfile?.studentCode ?? user.code ?? user.username,
    gender: user.profile.isFemale
      ? translate("courseGroupStudent.gender.female")
      : translate("courseGroupStudent.gender.male"),
    dateOfBirth: user.profile.dateOfBirth ?? "",
    avatarUrl: user.profile.avatarUrl ?? "",
  };
}

export function filterStudentRecords(
  students: StudentRecord[],
  searchValue: string,
  searchBy: StudentSearchCriterion
): StudentRecord[] {
  const keyword = normalizeSearchText(searchValue.trim());
  if (!keyword) return students;

  return students.filter((student) =>
    normalizeSearchText(student[searchBy]).includes(keyword)
  );
}
