import type {
  AttemptStatusFilter,
  ResultSearchCriterion,
  ResultTableRow,
  ResultViewMode,
  StudentResultRow,
} from "@/features/assessments/utils/buildResultTableData";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

interface FilterResultTableDataOptions {
  tableData: ResultTableRow[];
  studentRows: StudentResultRow[];
  viewMode: ResultViewMode;
  searchBy: ResultSearchCriterion;
  searchTerm: string;
  attemptStatusFilter: AttemptStatusFilter;
}

export function filterResultTableData({
  tableData,
  studentRows,
  viewMode,
  searchBy,
  searchTerm,
  attemptStatusFilter,
}: FilterResultTableDataOptions): ResultTableRow[] {
  if (viewMode !== "user") return tableData;

  const normalizedSearch = normalizeSearchText(searchTerm, { trim: true });
  const filteredStudents = studentRows.filter((student) => {
    const searchValue =
      searchBy === "studentId" ? student.username : student.fullName;
    const matchesSearch =
      !normalizedSearch ||
      normalizeSearchText(String(searchValue ?? "")).includes(normalizedSearch);
    const status = student.examAttempt?.status;
    const normalizedStatus =
      status === "SUBMITTED" || status === "IN_PROGRESS"
        ? status
        : "NOT_JOINED";
    const matchesStatus =
      attemptStatusFilter === "all" || normalizedStatus === attemptStatusFilter;

    return matchesSearch && matchesStatus;
  });
  const classAverageRow = tableData.find(
    (item): item is StudentResultRow =>
      item.rowType === "student" && item.isAverage === true
  );

  return classAverageRow
    ? [classAverageRow, ...filteredStudents]
    : filteredStudents;
}
