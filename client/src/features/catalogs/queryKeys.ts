export const catalogQueryKeys = {
  subjects: {
    root: ["subjects"] as const,
    list: (userId?: number, roleCode?: string | null) =>
      ["subjects", userId, roleCode] as const,
    withChapters: (userId?: number, roleCode?: string | null) =>
      ["subjects", "chapters", userId, roleCode] as const,
    byTeacher: (
      teacherId?: number,
      viewerId?: number,
      roleCode?: string | null,
    ) => ["subjects", "teacher", teacherId, viewerId, roleCode] as const,
    courseGroupsBySubject: (
      subjectId?: number,
      viewerId?: number,
      roleCode?: string | null,
    ) => ["subjects", "course-groups", subjectId, viewerId, roleCode] as const,
  },
  difficulties: {
    all: ["difficulties"] as const,
  },
  chapters: {
    bySubject: (subjectId?: number) =>
      ["chapters", "subject", subjectId] as const,
  },
};
