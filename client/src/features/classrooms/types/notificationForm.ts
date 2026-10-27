import type { Rule } from "antd/es/form";
import type { NotificationCreate } from "@/features/classrooms/types/classrooms";

export type NotificationFormValues = NotificationCreate;
export type NotificationFormField = keyof NotificationFormValues;

export type NotificationFieldRuleFactory = (
  field: NotificationFormField
) => Rule;

export interface NotificationSubjectGroup {
  subjectId: number;
  subjectName: string;
  groups: Array<{ id: number; label: string }>;
}
