import type { Subject } from "./catalogs";
import type { CourseGroup } from "./classrooms";
import type { User } from "./identity";
import type { Question } from "./question-bank";

export interface StudentExamResponse {
  exams: StudentExam[];
}

export interface StudentExamCourseGroup {
  id: number;
  groupName: string;
  subjectId: number;
  startTime: string | null;
  endTime: string | null;
}

export interface StudentExam {
  id: number;
  subjectId: number;
  examName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: number;

  examAttempt: ExamAttempt | null;
  canResume?: boolean;
  assignedCourseGroups?: StudentExamCourseGroup[];
}

export interface Exam {
  id: number;
  subjectId: number;
  examName: string;
  /** ISO 8601 timestamp, for example "2026-03-23T19:22:00.000000Z". */
  startTime: string;
  /** ISO 8601 timestamp. */
  endTime: string;
  /** Exam duration in minutes. */
  durationMinutes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: number;

  // Related values may be included when the API eager-loads them.
  subject: Subject;
  creator?: User;
  pivot?: {
    courseGroupId: number;
    examId: number;
  };

  courseGroups: CourseGroup[];
  assignedCourseGroups?: StudentExamCourseGroup[];

  questions: Question[];

  examConfiguration: ExamConfiguration;
}

// Exam status values are shared with the exam status utilities.
export type ExamStatusType = "UPCOMING" | "OPENING" | "CLOSED";

export interface StatusResult {
  labelKey: string;
  status: ExamStatusType;
}

export interface ExamConfiguration {
  examConfigurationId: number;
  examId: number;
  hasMonitoring: boolean;
  allowCopy: boolean;
  allowPrint: boolean;
  isEnableResume: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showScore: boolean;
  showDetailResults: boolean;
  isLimitSwitchTab: boolean;
  tabSwitchLimit: number;
  messageOnWarning: string; // The API may return null for this field.
  limitQuestionsPerPage: number;
  allowBackLastQuestion: number | boolean;
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface Option {
  label: string;
  value: number | string;
}

export type ExamStatus = "IN_PROGRESS" | "SAVED" | "SUBMITTED" | "CANCELLED";

export interface ExamAttempt {
  id: number;
  remainingSeconds?: number;
  startTime?: string; // ISO String
  deadlineAt?: string | null;
  submissionTime?: string | null; // ISO string, or null before submission.
  totalScore: number | null; // Null while the score is unavailable.
  correctAnswerCount: number | null; // Null before answers are graded.
  status: ExamStatus;
  createdAt?: string;
  updatedAt?: string;
  studentId: number;
  student?: User;
  examId: number;
  exam?: Exam;
  examAttemptAnswers?: ExamAttemptAnswer[];
  examAttemptLog?: ExamAttemptLog;
}

export interface ExamAttemptAnswer {
  examAttemptId: number;
  questionId: number;
  answerOptionId: number | null; // ID of the selected answer option.
  isSelectedCorrect: boolean; // Updated by the server when the attempt is submitted.
  score: number;
  updatedAt: string;
}

export interface ExamAttemptLog {
  examAttemptLogId: number;
  examAttemptId: number;
  tabSwitchCount: number;
  createdAt: string; // ISO string.
}

export interface CreateExamPayload {
  subjectId: number;
  creatorId: number;
  examName: string;
  startTime: string; // "YYYY-MM-DD HH:mm:ss" format.
  endTime: string;
  durationMinutes: number;
  courseGroupIds: number[]; // IDs of assigned classroom groups.
  questions: {
    id: number;
    order: number;
    score: number;
  }[];
  configuration: Omit<
    ExamConfiguration,
    "examConfigurationId" | "examId" | "createdAt" | "updatedAt"
  >;
}

export interface ExamResponseData {
  examAttempt: ExamAttempt;
  exam: Exam;
  questions: Question[];
}

export interface ExamReviewResponse {
  exam: Exam;
  examAttempts: { examAttempt: ExamAttempt; questions: Question[] }[];
}
