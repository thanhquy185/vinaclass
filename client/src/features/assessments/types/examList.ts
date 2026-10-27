export type ExamStatusFilter = 1 | 2 | 3 | 4;

export type ExamSearchCriterion = "name" | "subject";

export interface ExamSubjectOption {
  id: number;
  subjectName: string;
}

export type ExamDateTimeRange = [number, number] | null;
