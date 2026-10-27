import { getTestsStatus } from "@/features/assessments/utils/exam";
import type { Exam, StudentExam } from "@/shared/types";
import type { Notification } from "@/features/classrooms/types/classrooms";

export type CourseFeedItem =
  | (Notification & { feedType: "ANNOUNCEMENT" })
  | (Exam & { feedType: "EXAM" });

export function mergeCourseGroupFeed(
  announcements: Notification[],
  assignedExams: Exam[]
): CourseFeedItem[] {
  return [
    ...announcements.map((item) => ({
      ...item,
      feedType: "ANNOUNCEMENT" as const,
    })),
    ...assignedExams.map((item) => ({ ...item, feedType: "EXAM" as const })),
  ].sort((first, second) => {
    const firstTime =
      first.feedType === "ANNOUNCEMENT" ? first.sentAt : first.createdAt;
    const secondTime =
      second.feedType === "ANNOUNCEMENT" ? second.sentAt : second.createdAt;

    return new Date(secondTime).getTime() - new Date(firstTime).getTime();
  });
}

export function buildCourseGroupClasswork(
  isStudent: boolean,
  studentExams: StudentExam[],
  assignedExams: Exam[]
): StudentExam[] {
  const classwork = isStudent
    ? studentExams
    : assignedExams.map((exam) => ({
        ...exam,
        examAttempt: null,
        canResume: false,
      }));

  return [...classwork].sort((first, second) => {
    const firstDate = new Date(first.createdAt || first.startTime).getTime();
    const secondDate = new Date(second.createdAt || second.startTime).getTime();

    return secondDate - firstDate;
  });
}

export function findNearestUpcomingExam(
  exams: StudentExam[],
  now: Date
): StudentExam | undefined {
  return exams
    .filter(
      (exam) =>
        getTestsStatus(exam.startTime, exam.endTime, now).status === "UPCOMING"
    )
    .sort(
      (first, second) =>
        new Date(first.startTime).getTime() -
        new Date(second.startTime).getTime()
    )[0];
}
