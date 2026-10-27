import type { Exam } from "@/shared/types/assessments";
import type { User } from "@/features/identity/types/identity";
import type { Subject } from "@/shared/types/catalogs";

export interface NotificationBase {
  title: string;
  content: string;
  senderId: number;
}

export interface NotificationCreate {
  title: string;
  content: string;
  courseGroupIds: number[];
}

export type NotificationUpdate = Partial<NotificationCreate>;

export interface NotificationResponse extends NotificationBase {
  id: number;
  courseGroups: CourseGroup[];
  sentAt: string;
  priority: PriorityLevel;
  status: boolean;
  sender: User;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  sentAt: string;
  priority: PriorityLevel;
  status: boolean;
  senderId: number;
  sender: User;
}

export type PriorityLevel = 1 | 2 | 3;

export interface CourseGroupJoinRequest {
  joinCode: string;
}

export interface CourseGroupDetailStudent extends Omit<
  CourseGroup,
  "joinCode"
> {
  joinCode?: string;
  notifications: Notification[];
  exams: Exam[];
  students: User[];
  teacher: User;
}

export interface CourseGroupMaterial {
  id: number;
  courseGroupId: number;
  title: string;
  description: string | null;
  fileName: string;
  mimeType: string | null;
  fileSize: number;
  creatorId: number | null;
  creatorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseGroup {
  id: number;
  groupName: string;
  joinCode: string;
  studentCount: number | null;
  notes: string | null;
  semester: number;
  academicYear: number;
  teacherId: number | null;
  isHidden: boolean;
  isDeleted: boolean;
  subjectId: number;
  createdAt?: string;
  updatedAt?: string;
  pivot?: {
    studentId: number;
    courseGroupId: number;
  };
  teacher?: User;
  subject?: Subject;
  backgroundUrl?: string;
  exams?: Array<{
    id: number;
    examName: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface AssignedTeachingResponse {
  courseGroups: CourseGroup[];
  subjects: Subject[];
  summary: {
    totalCourseGroups: number;
    totalSubjects: number;
  };
}

export interface CourseGroupBase {
  subjectId: number;
  groupName: string;
  notes: string | null;
  semester: number;
  academicYear: number;
  teacherId: number | null;
  isHidden: boolean;
}

export type CourseGroupCreate = CourseGroupBase;

export type CourseGroupUpdate = Partial<CourseGroupBase>;

export interface CourseGroupStudentsResponse {
  students: User[];
}

export interface CourseGroupStudentImportResult {
  added: Array<{
    id: number;
    username: string;
    fullName: string;
  }>;
  missing: Array<{
    row: number;
    username: string;
  }>;
  count: number;
}
