export {
  useCourseGroups,
  useStudentCourseGroups,
  useCourseGroupDetail,
  useCourseGroupsByTeacher,
  useAssignedTeaching,
  useCourseGroupTeacher,
  useCourseGroupExams,
  useCourseGroupStudents,
  useCourseGroupStudentDetail,
} from "@/features/classrooms/hooks/useCourseGroupQueries";

export {
  useCreateCourseGroup,
  useUpdateCourseGroup,
  useDeleteCourseGroup,
  useJoinCourseGroup,
  useResetInviteCode,
  useAddStudentToCourseGroup,
  useRemoveStudentFromCourseGroup,
  useExportCourseGroupStudents,
  useImportCourseGroupStudents,
} from "@/features/classrooms/hooks/useCourseGroupMutations";
