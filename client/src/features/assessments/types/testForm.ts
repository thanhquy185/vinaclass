import type { Rule } from "antd/es/form";

export type TestFormValues = {
  examName?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number | null;
  subjectId?: number;
  courseGroupIds?: number[];
};

export type TestFormField =
  | "examName"
  | "startTime"
  | "endTime"
  | "durationMinutes"
  | "subjectId"
  | "courseGroupIds";

export type TestFieldRuleFactory = (field: TestFormField) => Rule;
