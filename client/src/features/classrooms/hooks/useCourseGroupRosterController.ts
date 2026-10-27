import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCourseGroupRosterActions } from "@/features/classrooms/hooks/useCourseGroupRosterActions";
import { useCourseGroupRosterData } from "@/features/classrooms/hooks/useCourseGroupRosterData";
import {
  filterStudentRecords,
  mapUserToStudentRecord,
  type StudentSearchCriterion,
} from "@/features/classrooms/utils/courseGroupStudentList";
import { useTablePagination } from "@/shared/hooks/useTablePagination";

const STUDENTS_PER_PAGE = 20;

export function useCourseGroupRosterController(groupId?: string) {
  const { t } = useTranslation("common");
  const rosterData = useCourseGroupRosterData(groupId);
  const actions = useCourseGroupRosterActions({
    groupId: rosterData.parsedGroupId,
  });
  const [searchValue, setSearchValue] = useState("");
  const [searchBy, setSearchBy] = useState<StudentSearchCriterion>("fullName");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isInviteCodeOpen, setIsInviteCodeOpen] = useState(false);

  const studentRows = useMemo(
    () =>
      rosterData.students.map((student, index) =>
        mapUserToStudentRecord(student, index, t)
      ),
    [rosterData.students, t]
  );
  const filteredStudents = useMemo(
    () => filterStudentRecords(studentRows, searchValue, searchBy),
    [studentRows, searchBy, searchValue]
  );
  const pagination = useTablePagination(
    filteredStudents.length,
    STUDENTS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    pagination.setCurrentPage(1);
  };
  const handleSearchByChange = (criterion: StudentSearchCriterion) => {
    setSearchBy(criterion);
    pagination.setCurrentPage(1);
  };
  const resetStudentFilters = () => {
    setSearchValue("");
    setSearchBy("fullName");
    pagination.setCurrentPage(1);
  };

  return {
    ...rosterData,
    students: filteredStudents,
    studentCount: studentRows.length,
    searchValue,
    searchBy,
    canResetFilters: searchValue.trim().length > 0 || searchBy !== "fullName",
    handleSearchChange,
    handleSearchByChange,
    resetStudentFilters,
    pagination: pagination.pagination,
    isAddStudentOpen,
    isInviteCodeOpen,
    openAddStudentDialog: () => setIsAddStudentOpen(true),
    closeAddStudentDialog: () => setIsAddStudentOpen(false),
    openInviteCodeDialog: () => setIsInviteCodeOpen(true),
    closeInviteCodeDialog: () => setIsInviteCodeOpen(false),
    canAddStudent: rosterData.canManageRoster,
    canRemoveStudent: rosterData.canManageRoster,
    canUpdateInviteCode: rosterData.canManageRoster,
    ...actions,
  };
}
