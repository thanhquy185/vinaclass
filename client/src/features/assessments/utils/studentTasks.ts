import type { Exam, ExamAttempt, StudentExamCourseGroup } from "@/shared/types";
import type {
  StudentTask,
  StudentTaskSection,
  StudentTaskSectionKey,
  StudentTaskTab,
} from "@/features/assessments/types/studentTask";
import { getTestsStatus } from "@/features/assessments/utils/exam";

const SECTION_ORDER: StudentTaskSectionKey[] = [
  "noDueDate",
  "overdue",
  "thisWeek",
  "nextWeek",
  "later",
];

const SECTION_TITLE_KEYS: Record<StudentTaskSectionKey, string> = {
  noDueDate: "tasks.sections.noDueDate",
  overdue: "tasks.sections.overdue",
  thisWeek: "tasks.sections.thisWeek",
  nextWeek: "tasks.sections.nextWeek",
  later: "tasks.sections.later",
};

function latestAttemptsByExam(
  attempts: ExamAttempt[]
): Map<number, ExamAttempt> {
  const latest = new Map<number, ExamAttempt>();

  attempts.forEach((attempt) => {
    const current = latest.get(attempt.examId);
    const attemptTime = new Date(
      attempt.createdAt ?? attempt.submissionTime ?? 0
    ).getTime();
    const currentTime = current
      ? new Date(current.createdAt ?? current.submissionTime ?? 0).getTime()
      : -Infinity;

    if (!current || attemptTime >= currentTime) {
      latest.set(attempt.examId, attempt);
    }
  });

  return latest;
}

export function buildStudentTasks(
  exams: Exam[],
  attempts: ExamAttempt[],
  now: Date
): StudentTask[] {
  const attemptsByExam = latestAttemptsByExam(attempts);

  return exams.flatMap((exam) => {
    // The student endpoint provides only assignments visible through the
    // student's active class memberships. Never fall back to a generic exam
    // courseGroups relation, which may contain classes the student does not join.
    const assignments: StudentExamCourseGroup[] = exam.assignedCourseGroups ?? [];

    return assignments.map((courseGroup) => {
      const attempt = attemptsByExam.get(exam.id) ?? null;
      const startsAt = courseGroup.startTime ?? exam.startTime ?? null;
      const dueAt = courseGroup.endTime ?? exam.endTime ?? null;
      const testStatus = getTestsStatus(startsAt, dueAt, now).status;
      const status: StudentTaskTab =
        attempt?.status === "SUBMITTED"
          ? "done"
          : dueAt && testStatus === "CLOSED"
            ? "missing"
            : "assigned";

      return {
        key: `${exam.id}-${courseGroup.id}`,
        exam,
        attempt,
        courseGroup,
        startsAt,
        dueAt,
        status,
      };
    });
  });
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

export function getStudentTaskSectionKey(
  dueAt: string | null,
  now: Date
): StudentTaskSectionKey {
  if (!dueAt) return "noDueDate";

  const dueDate = new Date(dueAt);
  if (!Number.isFinite(dueDate.getTime())) return "noDueDate";

  const today = startOfDay(now);
  if (dueDate < today) return "overdue";

  const thisWeekStart = startOfWeek(now);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const weekAfterNextStart = new Date(nextWeekStart);
  weekAfterNextStart.setDate(weekAfterNextStart.getDate() + 7);

  if (dueDate < nextWeekStart) return "thisWeek";
  if (dueDate < weekAfterNextStart) return "nextWeek";
  return "later";
}

export function groupStudentTasksByDueDate(
  tasks: StudentTask[],
  now: Date
): StudentTaskSection[] {
  const grouped = new Map<StudentTaskSectionKey, StudentTask[]>();

  tasks.forEach((task) => {
    const key = getStudentTaskSectionKey(task.dueAt, now);
    const sectionTasks = grouped.get(key) ?? [];
    sectionTasks.push(task);
    grouped.set(key, sectionTasks);
  });

  return SECTION_ORDER.flatMap((key) => {
    const sectionTasks = grouped.get(key);
    if (!sectionTasks?.length) return [];

    return [
      {
        key,
        titleKey: SECTION_TITLE_KEYS[key],
        tasks: sectionTasks.sort((first, second) => {
          const firstDate = first.dueAt
            ? new Date(first.dueAt).getTime()
            : Infinity;
          const secondDate = second.dueAt
            ? new Date(second.dueAt).getTime()
            : Infinity;
          return firstDate - secondDate;
        }),
      },
    ];
  });
}

export function filterStudentTasks(
  tasks: StudentTask[],
  tab: StudentTaskTab,
  courseGroupId: string
): StudentTask[] {
  return tasks.filter(
    (task) =>
      task.status === tab &&
      (courseGroupId === "all" ||
        String(task.courseGroup?.id ?? "unassigned") === courseGroupId)
  );
}
