import type {
  CourseGroupCreate,
  CourseGroupUpdate,
} from "@/features/classrooms/types/classrooms";
import type {
  CourseGroupEditFormState,
  CourseGroupFormData,
} from "@/features/classrooms/types/courseGroupForm";
import type { GroupDisplay } from "@/features/classrooms/types/courseGroupList";

export function toCourseGroupEditFormState(
  group: GroupDisplay
): CourseGroupEditFormState {
  const subjectLabel = [group.subject?.subjectCode, group.subject?.subjectName]
    .filter(Boolean)
    .join(" · ");

  return {
    data: {
      subjectId: Number(group.subjectId),
      groupName: group.groupName,
      note: group.notes || "",
      subject: subjectLabel,
      academicYear: group.academicYear,
      semester: group.semester,
      teacherId: group.teacherId,
      joinCode: group.joinCode || "",
      siSo: group.studentCount,
    },
    groupId: group.id,
  };
}

export function toCourseGroupCreatePayload(
  data: CourseGroupFormData
): CourseGroupCreate {
  return {
    subjectId: data.subjectId,
    groupName: data.groupName,
    notes: data.note,
    semester: data.semester,
    academicYear: data.academicYear,
    teacherId: data.teacherId,
    isHidden: false,
  };
}

export function toCourseGroupUpdatePayload(
  data: CourseGroupFormData
): CourseGroupUpdate {
  return {
    subjectId: data.subjectId,
    groupName: data.groupName,
    notes: data.note,
    semester: data.semester,
    academicYear: data.academicYear,
    teacherId: data.teacherId,
  };
}
