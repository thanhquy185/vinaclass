import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";
import type {
  CourseStatus,
  CourseGroupSearchCriterion,
  GroupDisplay,
  GroupSection,
} from "@/features/classrooms/types/courseGroupList";

export function addCourseGroupStatus(groups: CourseGroup[]): GroupDisplay[] {
  return groups.map((group) => ({
    ...group,
    status: group.isHidden ? "hidden" : "active",
  }));
}

export function filterCourseGroups(
  groups: GroupDisplay[],
  status: CourseStatus,
  searchValue: string,
  searchBy: CourseGroupSearchCriterion
): GroupDisplay[] {
  const keyword = normalizeSearchText(searchValue.trim());

  return groups.filter((group) => {
    if (group.status !== status) return false;
    if (!keyword) return true;

    const searchFields = {
      groupName: [group.groupName],
      teacher: [
        group.teacher?.profile.fullName,
        group.teacher?.username,
        group.teacher?.email,
        group.teacher?.teacherProfile?.teacherCode ?? group.teacher?.code,
      ],
      subject: [group.subject?.subjectName, group.subject?.subjectCode],
    }[searchBy];

    return searchFields.some((field) =>
      normalizeSearchText(field ?? "").includes(keyword)
    );
  });
}

export function groupCourseGroups(
  groups: GroupDisplay[],
  getSectionTitle: (group: GroupDisplay) => string
): GroupSection[] {
  const sections = new Map<string, GroupSection>();

  groups.forEach((group) => {
    const key = `${group.subjectId}-${group.academicYear}-${group.semester}`;
    let section = sections.get(key);

    if (!section) {
      section = {
        key,
        title: getSectionTitle(group),
        groups: [],
      };
      sections.set(key, section);
    }

    section.groups.push(group);
  });

  return Array.from(sections.values()).sort((first, second) =>
    first.title.localeCompare(second.title)
  );
}
