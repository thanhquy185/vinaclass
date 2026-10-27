import type { Subject } from "@/shared/types/catalogs";
import type { User } from "@/features/identity/types/identity";

export interface AssignmentRequest {
  teacherId: number | null;
  subjectIds: number[];
}

export type AssignedTeacher = Omit<
  Pick<
    User,
    | "id"
    | "username"
    | "email"
    | "roleId"
    | "roleCode"
    | "profile"
    | "teacherProfile"
  >,
  "email"
> & { email?: string };

export interface TeacherSubject {
  teacherId: number;
  subjectId: number;
  subject: Subject;
  teacher: AssignedTeacher;
}

export interface AssignmentSubjectSummary {
  id: number;
  subjectCode: string;
  subjectName: string;
}

export interface TeacherAssignmentGroup {
  teacherId: number;
  teacher: AssignedTeacher;
  subjects: AssignmentSubjectSummary[];
}

export interface AssignmentOverviewStats {
  assignmentCount: number;
  teacherCount: number;
  subjectCount: number;
}

export interface AssignmentOverviewPagination {
  currentPage: number;
  pageSize: number;
  total: number;
  lastPage: number;
}

export interface AssignmentOverviewResponse {
  groups: TeacherAssignmentGroup[];
  stats: AssignmentOverviewStats;
  pagination: AssignmentOverviewPagination;
}

export interface AssignmentOverviewParams {
  searchBy: "subject" | "teacher";
  searchTerm: string;
  page: number;
  pageSize: number;
}

export interface TeacherAssignmentRemoval {
  teacherId: number;
  subjectId: number;
  teacherName: string;
  subjectName: string;
}
