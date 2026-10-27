export const teacherAssignmentQueryKeys = {
  root: ["assignments"] as const,
  overview: (params: {
    searchBy: "subject" | "teacher";
    searchTerm: string;
    page: number;
    pageSize: number;
  }) => ["assignments", "overview", params] as const,
  byTeacher: (teacherId: number) =>
    ["assignments", "teacher", teacherId] as const,
};
