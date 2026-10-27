import { useEffect, useMemo, useState } from "react";
import { App } from "antd";
import { useTranslation } from "react-i18next";
import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import { usePaginatedList } from "@/shared/hooks/usePaginatedList";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import {
  useAssignedTeaching,
  useStudentCourseGroups,
} from "@/features/classrooms/hooks/useCourseGroupQueries";
import { useJoinCourseGroup } from "@/features/classrooms/hooks/useCourseGroupMutations";
import { useStudentExams } from "@/features/assessments/hooks/useExamQueries";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useCourseGroupManagement } from "@/features/classrooms/hooks/useCourseGroupManagement";

const COURSE_GROUPS_PER_PAGE = 12;
const ALL = "all";
const EMPTY_COURSE_GROUPS: CourseGroup[] = [];
const NOOP = () => undefined;

const sortCourseGroups = (groups: CourseGroup[], direction: "asc" | "desc") =>
  [...groups].sort((first, second) => {
    const comparison = first.groupName.localeCompare(second.groupName, "vi", {
      sensitivity: "base",
    });
    return direction === "asc" ? comparison : -comparison;
  });

export function useClassroomPageController() {
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const isStudent = roleCode === "STUDENT";
  const isTeacher = roleCode === "TEACHER";
  const canBrowseClassrooms = isStudent || isTeacher;
  const classGroupPermissions = useFunctionActions("hoc_phan");
  const canCreateGroup = isTeacher && classGroupPermissions.hasAction("create");
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showHiddenClasses, setShowHiddenClasses] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [academicYearFilter, setAcademicYearFilter] = useState(ALL);
  const [semesterFilter, setSemesterFilter] = useState(ALL);
  const [now, setNow] = useState(() => Date.now());
  const { mutateAsync, isPending: isJoining } = useJoinCourseGroup();
  const studentQuery = useStudentCourseGroups(
    isStudent ? (user?.id ?? null) : null
  );
  const teacherQuery = useAssignedTeaching(
    isTeacher ? (user?.id ?? null) : null,
    isTeacher,
    true
  );
  const studentExamQuery = useStudentExams(
    isStudent ? (user?.id ?? null) : null,
    isStudent
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const courseGroups = useMemo(
    () =>
      isTeacher
        ? teacherQuery.courseGroups
        : (studentQuery.courseGroups ?? EMPTY_COURSE_GROUPS),
    [isTeacher, studentQuery.courseGroups, teacherQuery.courseGroups]
  );
  const courseGroupManagement = useCourseGroupManagement({
    courseGroups,
    onCloseMenu: NOOP,
  });
  const isLoading = isTeacher ? teacherQuery.isLoading : studentQuery.isLoading;
  const isFetching = isTeacher
    ? teacherQuery.isFetching
    : studentQuery.isFetching;
  const isError = isTeacher ? teacherQuery.isError : studentQuery.isError;
  const refetch = isTeacher ? teacherQuery.refetch : studentQuery.refetch;

  const subjects = useMemo(() => {
    const byId = new Map<number, NonNullable<CourseGroup["subject"]>>();
    courseGroups.forEach((group) => {
      if (group.subject) byId.set(group.subject.id, group.subject);
    });
    return [...byId.values()].sort((first, second) =>
      first.subjectName.localeCompare(second.subjectName, "vi", {
        sensitivity: "base",
      })
    );
  }, [courseGroups]);

  const academicYears = useMemo(
    () =>
      [...new Set(courseGroups.map((group) => group.academicYear))].sort(
        (a, b) => b - a
      ),
    [courseGroups]
  );

  const matchingGroups = useMemo(() => {
    const keyword = normalizeSearchText(searchValue.trim());
    return courseGroups.filter((group) => {
      const matchesKeyword =
        !keyword ||
        normalizeSearchText(group.groupName ?? "").includes(keyword) ||
        normalizeSearchText(group.subject?.subjectName ?? "").includes(
          keyword
        ) ||
        normalizeSearchText(group.subject?.subjectCode ?? "").includes(keyword);
      const matchesSubject =
        subjectFilter === ALL || String(group.subjectId) === subjectFilter;
      const matchesYear =
        academicYearFilter === ALL ||
        String(group.academicYear) === academicYearFilter;
      const matchesSemester =
        semesterFilter === ALL || String(group.semester) === semesterFilter;
      return matchesKeyword && matchesSubject && matchesYear && matchesSemester;
    });
  }, [
    academicYearFilter,
    courseGroups,
    searchValue,
    semesterFilter,
    subjectFilter,
  ]);

  const activeCourseGroups = useMemo(
    () =>
      sortCourseGroups(
        matchingGroups.filter((group) => !group.isHidden),
        sortDirection
      ),
    [matchingGroups, sortDirection]
  );
  const hiddenCourseGroups = useMemo(
    () =>
      sortCourseGroups(
        matchingGroups.filter((group) => group.isHidden),
        sortDirection
      ),
    [matchingGroups, sortDirection]
  );
  const {
    currentPage: activePage,
    totalPages: activeTotalPages,
    pageItems: activePageGroups,
    setCurrentPage: setActivePage,
  } = usePaginatedList(activeCourseGroups, COURSE_GROUPS_PER_PAGE);
  const {
    currentPage: hiddenPage,
    totalPages: hiddenTotalPages,
    pageItems: hiddenPageGroups,
    setCurrentPage: setHiddenPage,
  } = usePaginatedList(hiddenCourseGroups, COURSE_GROUPS_PER_PAGE);

  const upcomingItems = useMemo(() => {
    if (isTeacher) {
      return courseGroups.flatMap((group) =>
        (group.exams ?? [])
          .filter((exam) => new Date(exam.endTime).getTime() >= now)
          .map((exam) => ({
            id: exam.id,
            title: exam.examName,
            courseName: group.groupName,
            endTime: exam.endTime,
          }))
      );
    }
    return (studentExamQuery.exams ?? [])
      .filter((exam) => new Date(exam.endTime).getTime() >= now)
      .map((exam) => ({
        id: exam.id,
        title: exam.examName,
        courseName: t("coursePage.upcomingExamLabel"),
        endTime: exam.endTime,
      }));
  }, [courseGroups, isTeacher, now, studentExamQuery.exams, t]);
  const sortedUpcomingItems = useMemo(
    () =>
      [...upcomingItems]
        .sort(
          (first, second) =>
            new Date(first.endTime).getTime() -
            new Date(second.endTime).getTime()
        )
        .slice(0, 3),
    [upcomingItems]
  );

  const resetPagination = () => {
    setActivePage(1);
    setHiddenPage(1);
  };
  const resetFilters = () => {
    setSearchValue("");
    setSubjectFilter(ALL);
    setAcademicYearFilter(ALL);
    setSemesterFilter(ALL);
    resetPagination();
  };
  const handleJoinClass = async (code: string) => {
    try {
      await mutateAsync({ joinCode: code });
      message.success(t("coursePage.joinSuccess"));
      setIsOpenModal(false);
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error) ?? t("coursePage.joinError"));
    }
  };

  return {
    canBrowseClassrooms,
    isStudent,
    isTeacher,
    canCreateGroup,
    isCourseGroupFormOpen: courseGroupManagement.isFormOpen,
    isCourseGroupFormProcessing: courseGroupManagement.isProcessing,
    openCreateCourseGroupForm: courseGroupManagement.openCreateForm,
    closeCourseGroupForm: courseGroupManagement.closeForm,
    saveCourseGroupForm: courseGroupManagement.saveForm,
    roleCode,
    currentUserName: user?.profile.fullName?.trim() || user?.username || "",
    isOpenModal,
    showHiddenClasses,
    searchValue,
    sortDirection,
    subjectFilter,
    academicYearFilter,
    semesterFilter,
    subjects,
    academicYears,
    isJoining,
    isLoading,
    isFetching,
    isError,
    refetch,
    activeCourseGroups,
    hiddenCourseGroups,
    activePage,
    activeTotalPages,
    activePageGroups,
    hiddenPage,
    hiddenTotalPages,
    hiddenPageGroups,
    upcomingItems: sortedUpcomingItems,
    studentExamLoading: studentExamQuery.isLoading,
    handleSearchChange: (value: string) => {
      setSearchValue(value);
      resetPagination();
    },
    handleSubjectChange: (value: string) => {
      setSubjectFilter(value);
      resetPagination();
    },
    handleAcademicYearChange: (value: string) => {
      setAcademicYearFilter(value);
      resetPagination();
    },
    handleSemesterChange: (value: string) => {
      setSemesterFilter(value);
      resetPagination();
    },
    resetFilters,
    toggleSortDirection: () =>
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc")),
    handleJoinClass,
    openJoinClassModal: () => setIsOpenModal(true),
    closeJoinClassModal: () => setIsOpenModal(false),
    toggleHiddenClasses: () => setShowHiddenClasses((shown) => !shown),
    setActivePage,
    setHiddenPage,
  };
}
