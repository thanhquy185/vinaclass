import type {
  CourseGroupCreate,
  CourseGroupJoinRequest,
  CourseGroupUpdate,
} from "@/features/classrooms/types/classrooms";

export const mapCourseGroupCreatePayload = (data: CourseGroupCreate) => ({
  subject_id: data.subjectId,
  group_name: data.groupName,
  notes: data.notes,
  semester: data.semester,
  academic_year: data.academicYear,
  teacher_id: data.teacherId,
  is_hidden: data.isHidden,
});

export const mapCourseGroupUpdatePayload = (data: CourseGroupUpdate) => ({
  ...(data.subjectId !== undefined && { subject_id: data.subjectId }),
  ...(data.groupName !== undefined && { group_name: data.groupName }),
  ...(data.notes !== undefined && { notes: data.notes }),
  ...(data.semester !== undefined && { semester: data.semester }),
  ...(data.academicYear !== undefined && {
    academic_year: data.academicYear,
  }),
  ...(data.teacherId !== undefined && { teacher_id: data.teacherId }),
  ...(data.isHidden !== undefined && { is_hidden: data.isHidden }),
});

export const mapCourseGroupJoinPayload = (data: CourseGroupJoinRequest) => ({
  join_code: data.joinCode,
});

export const mapStudentRemovalPayload = (studentId: number) => ({
  student_id: studentId,
});
