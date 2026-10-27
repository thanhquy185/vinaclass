import type { CourseGroup } from "@/features/classrooms/types/classrooms";

export type CourseStatus = "active" | "hidden";
export type CourseGroupSearchCriterion = "groupName" | "teacher" | "subject";

export type GroupDisplay = CourseGroup & { status: CourseStatus };

export interface GroupSection {
  key: string;
  title: string;
  groups: GroupDisplay[];
}
