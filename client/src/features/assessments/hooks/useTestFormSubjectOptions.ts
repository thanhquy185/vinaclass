import { useMemo } from "react";
import type { CourseGroup, RoleResponse, Subject } from "@/shared/types";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";

interface UseTestFormSubjectOptions {
  role: RoleResponse | null;
  allSubjects: Subject[];
  teacherSubjects: Subject[];
  isLoadingSubjects: boolean;
  isLoadingTeacherSubjects: boolean;
  contextualCourseGroup?: CourseGroup;
}

export function useTestFormSubjectOptions({
  role,
  allSubjects,
  teacherSubjects,
  isLoadingSubjects,
  isLoadingTeacherSubjects,
  contextualCourseGroup,
}: UseTestFormSubjectOptions) {
  const roleKind = getAuthenticatedRoleKind(null, role);
  const availableSubjects = useMemo<Subject[]>(() => {
    let subjects: Subject[];

    switch (roleKind) {
      case "TEACHER":
        subjects = teacherSubjects;
        break;
      case "ADMIN":
      case "CUSTOM":
        subjects = allSubjects;
        break;
      default:
        return [];
    }

    if (!contextualCourseGroup) return subjects;

    return subjects.map((subject) =>
      subject.id === contextualCourseGroup.subjectId
        ? {
            ...subject,
            courseGroups: [
              ...(subject.courseGroups ?? []).filter(
                (group) => group.id !== contextualCourseGroup.id
              ),
              contextualCourseGroup,
            ],
          }
        : subject
    );
  }, [allSubjects, contextualCourseGroup, roleKind, teacherSubjects]);

  const isLoadingSubjectOptions =
    isLoadingSubjects || (roleKind === "TEACHER" && isLoadingTeacherSubjects);

  return { availableSubjects, isLoadingSubjectOptions };
}
