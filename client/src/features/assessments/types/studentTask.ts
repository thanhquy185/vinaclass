import type { Exam, ExamAttempt, StudentExamCourseGroup } from "@/shared/types";

export type StudentTaskTab = "assigned" | "missing" | "done";

export type StudentTaskStatus = StudentTaskTab;

export type StudentTaskSectionKey =
  | "noDueDate"
  | "overdue"
  | "thisWeek"
  | "nextWeek"
  | "later";

export interface StudentTask {
  key: string;
  exam: Exam;
  attempt: ExamAttempt | null;
  courseGroup: StudentExamCourseGroup | null;
  startsAt: string | null;
  dueAt: string | null;
  status: StudentTaskStatus;
}

export interface StudentTaskSection {
  key: StudentTaskSectionKey;
  titleKey: string;
  tasks: StudentTask[];
}
