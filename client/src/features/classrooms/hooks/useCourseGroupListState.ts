import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import { usePaginatedList } from "@/shared/hooks/usePaginatedList";
import type {
  CourseStatus,
  CourseGroupSearchCriterion,
  GroupSection,
} from "@/features/classrooms/types/courseGroupList";
import {
  addCourseGroupStatus,
  filterCourseGroups,
  groupCourseGroups,
} from "@/features/classrooms/utils/courseGroupList";

const COURSE_GROUPS_PER_PAGE = 12;

interface UseCourseGroupListStateOptions {
  courseGroups: CourseGroup[];
  getSectionTitle: (group: CourseGroup) => string;
}

export function useCourseGroupListState({
  courseGroups,
  getSectionTitle,
}: UseCourseGroupListStateOptions) {
  const [statusFilter, setStatusFilter] = useState<CourseStatus>("active");
  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] =
    useState<CourseGroupSearchCriterion>("groupName");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  useEffect(() => {
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [closeMenu]);

  const computedGroups = useMemo(
    () => addCourseGroupStatus(courseGroups),
    [courseGroups]
  );
  const filteredGroups = useMemo(
    () =>
      filterCourseGroups(computedGroups, statusFilter, searchValue, searchBy),
    [computedGroups, searchBy, searchValue, statusFilter]
  );
  const {
    currentPage,
    totalPages,
    pageItems: pageGroups,
    setCurrentPage,
  } = usePaginatedList(filteredGroups, COURSE_GROUPS_PER_PAGE);
  const groupedSections = useMemo<GroupSection[]>(
    () => groupCourseGroups(pageGroups, getSectionTitle),
    [getSectionTitle, pageGroups]
  );

  const handleToggleMenu = (groupId: number) => {
    setOpenMenu((previous) => (previous === groupId ? null : groupId));
  };

  const handleToggleSection = (sectionKey: string) => {
    setCollapsedSections((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }));
  };

  const handleStatusChange = (nextStatus: CourseStatus) => {
    setStatusFilter(nextStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleSearchByChange = (criterion: CourseGroupSearchCriterion) => {
    setSearchBy(criterion);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter("active");
    setSearchValue("");
    setSearchBy("groupName");
    setCurrentPage(1);
  };

  return {
    statusFilter,
    searchValue,
    searchBy,
    openMenu,
    collapsedSections,
    currentPage,
    totalPages,
    groupedSections,
    visibleGroups: filteredGroups,
    hasSections: groupedSections.length > 0,
    hasGroups: filteredGroups.length > 0,
    canResetFilters:
      statusFilter !== "active" ||
      searchValue.length > 0 ||
      searchBy !== "groupName",
    handleStatusChange,
    handleSearchChange,
    handleSearchByChange,
    resetFilters,
    handleToggleMenu,
    handleToggleSection,
    setCurrentPage,
    closeMenu,
  };
}
