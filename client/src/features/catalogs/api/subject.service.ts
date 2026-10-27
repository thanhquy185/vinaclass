import type {
  ApiResponse,
  SubjectWithChapters,
  Subject,
  SubjectWithGroup,
  CourseGroup,
  SubjectRequest,
  SubjectUpdateRequest,
} from "@/shared/types";
import axiosClient from "@/shared/api/axios";

export const subjectService = {
  getAllSubjects: (): Promise<ApiResponse<Subject[]>> =>
    axiosClient.get("/subjects"),

  getSubjectById: (subjectId: number): Promise<ApiResponse<Subject>> =>
    axiosClient.get(`/subjects/${subjectId}`),

  getSubjectsByTeacher: (teacherId: number): Promise<ApiResponse<Subject[]>> =>
    axiosClient.get(`/subjects/teacher/${teacherId}`),

  createSubject: (data: SubjectRequest): Promise<ApiResponse<Subject>> =>
    axiosClient.post("/subjects", {
      subject_name: data.subjectName,
      subject_code: data.subjectCode,
      credit_count: data.creditCount,
      theory_hours: data.theoryHours,
      practice_hours: data.practiceHours,
      ...(data.chapters && {
        chapters: data.chapters.map(({ chapterName }) => ({
          chapter_name: chapterName,
        })),
      }),
    }),

  updateSubject: (
    subjectId: number,
    data: SubjectUpdateRequest,
  ): Promise<ApiResponse<Subject>> =>
    axiosClient.put(`/subjects/${subjectId}`, {
      ...(data.subjectName !== undefined && { subject_name: data.subjectName }),
      ...(data.creditCount !== undefined && { credit_count: data.creditCount }),
      ...(data.theoryHours !== undefined && { theory_hours: data.theoryHours }),
      ...(data.practiceHours !== undefined && {
        practice_hours: data.practiceHours,
      }),
    }),

  deleteSubject: (subjectId: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/subjects/${subjectId}`),

  getSubjectsWithCourseGroups: (): Promise<ApiResponse<SubjectWithGroup[]>> =>
    axiosClient.get("/subjects/with-course-groups"),

  getCourseGroupsForExam: (
    subjectId: number,
  ): Promise<ApiResponse<CourseGroup[]>> =>
    axiosClient.get(`/subjects/${subjectId}/course-groups`),

  getSubjectsWithChapters: (): Promise<ApiResponse<SubjectWithChapters[]>> =>
    axiosClient.get("/subjects/with-chapters"),
};
