export const assessmentQueryKeys = {
  exams: {
    all: ["exams"] as const,
    list: (userId?: number) => ["exams", "all", userId] as const,
    byCourseGroupAndStudent: (courseGroupId?: number, studentId?: number) =>
      ["exams", courseGroupId, studentId] as const,
    studentRoot: ["exams", "student"] as const,
    student: (studentId: number | null, viewerId?: number) =>
      ["exams", "student", studentId, viewerId] as const,
    detail: (examId: number | null, userId?: number) =>
      ["exams", "detail", examId, userId] as const,
    detailPrefix: (examId: number) => ["exams", "detail", examId] as const,
  },
  attempts: {
    all: ["exam-attempts"] as const,
    list: (scope: "student" | "all", userId?: number) =>
      ["exam-attempts", scope, userId] as const,
    group: (courseGroupId?: number, examId?: number, userId?: number) =>
      ["exam-attempts", "group", courseGroupId, examId, userId] as const,
  },
};
