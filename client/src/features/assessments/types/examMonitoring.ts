export type ExamMode = "STUDENT" | "PREVIEW";

export interface ViolationUpdate {
  examAttemptId: number;
  count: number;
}

export type UpdateViolation = (input: ViolationUpdate) => void;
