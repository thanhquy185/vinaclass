export const courseGroupQueryKeys = {
  root: ["course-groups"] as const,
  list: (userId?: number) => ["course-groups", userId] as const,
  studentList: (studentId: number | null, viewerId?: number) =>
    ["course-groups", "student", studentId, viewerId] as const,
  detail: (courseGroupId: number, viewerId?: number) =>
    ["course-groups", "detail", courseGroupId, viewerId] as const,
  teacherList: (teacherId?: number, viewerId?: number) =>
    ["course-groups", "teacher", teacherId, viewerId] as const,
  assignedTeaching: (teacherId?: number, viewerId?: number) =>
    ["course-groups", "assigned-teaching", teacherId, viewerId] as const,
  teacherDetail: (courseGroupId: number, viewerId?: number) =>
    ["course-groups", "teacher-detail", courseGroupId, viewerId] as const,
  exams: (courseGroupId: number, viewerId?: number) =>
    ["course-groups", "exams", courseGroupId, viewerId] as const,
  students: (courseGroupId: number, viewerId?: number) =>
    ["course-groups", "students", courseGroupId, viewerId] as const,
  studentsForGroup: (courseGroupId: number) =>
    ["course-groups", "students", courseGroupId] as const,
  studentDetail: (courseGroupId: number, viewerId?: number) =>
    ["course-groups", "student-detail", courseGroupId, viewerId] as const,
  notifications: (courseGroupId?: number) =>
    ["course-groups", "notifications", courseGroupId] as const,
  materials: (courseGroupId: number, userId: number | null) =>
    ["course-groups", "materials", courseGroupId, userId] as const,
  materialsForGroup: (courseGroupId: number) =>
    ["course-groups", "materials", courseGroupId] as const,
};

export const notificationQueryKeys = {
  root: ["notifications"] as const,
  list: (userId: number | null) => ["notifications", userId] as const,
};
