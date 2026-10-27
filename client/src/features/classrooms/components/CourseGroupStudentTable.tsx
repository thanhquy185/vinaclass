import { Empty, Pagination as AntPagination } from "antd";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { StudentRecord } from "@/shared/types";
import { Button, IdentityAvatar } from "@/shared/components/ui";
import {
  AdminSearchField,
  type AdminSearchCriterion,
} from "@/shared/components/admin";
import type { StudentSearchCriterion } from "@/features/classrooms/utils/courseGroupStudentList";

interface CourseGroupStudentTableProps {
  students: StudentRecord[];
  searchValue: string;
  searchBy: StudentSearchCriterion;
  canResetFilters: boolean;
  canAddStudent: boolean;
  canRemoveStudent: boolean;
  isRemovingStudent: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (criterion: StudentSearchCriterion) => void;
  onResetFilters: () => void;
  onAddStudent: () => void;
  onRemoveStudent: (student: StudentRecord) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export default function CourseGroupStudentTable({
  students,
  searchValue,
  searchBy,
  canResetFilters,
  canAddStudent,
  canRemoveStudent,
  isRemovingStudent,
  onSearchChange,
  onSearchByChange,
  onResetFilters,
  onAddStudent,
  onRemoveStudent,
  pagination,
}: CourseGroupStudentTableProps) {
  const { t, i18n } = useTranslation("common");

  const formatDateOfBirth = (dateValue: string) => {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "vi", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(date);
  };

  const criteria: AdminSearchCriterion<StudentSearchCriterion>[] = [
    {
      value: "fullName",
      label: t("courseGroupStudent.filter.byName"),
      placeholder: t("courseGroupStudent.filter.namePlaceholder"),
    },
    {
      value: "studentCode",
      label: t("courseGroupStudent.filter.byStudentCode"),
      placeholder: t("courseGroupStudent.filter.studentCodePlaceholder"),
    },
    {
      value: "email",
      label: t("courseGroupStudent.filter.byEmail"),
      placeholder: t("courseGroupStudent.filter.emailPlaceholder"),
    },
  ];
  const currentStudents = students.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-other-outlined-border bg-background-paper shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-other-divider px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h2 className="text-body-1 font-semibold text-text-primary">
              {t("courseGroupStudent.tableTitle")}
            </h2>
            <p className="text-caption mt-0.5 text-text-secondary">
              {t("courseGroupStudent.resultsCount", {
                count: pagination.total,
              })}
            </p>
          </div>
        </div>
        {canAddStudent && (
          <Button
            variant="contained"
            color="primary"
            size="medium"
            className="!h-10 !rounded-lg px-4"
            onClick={onAddStudent}
          >
            <Plus size={17} aria-hidden="true" />
            {t("courseGroupStudent.addStudent")}
          </Button>
        )}
      </div>

      <div className="bg-background-body-background/40 flex flex-col gap-3 border-b border-other-divider px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <AdminSearchField<StudentSearchCriterion>
          label={t("courseGroupStudent.filter.searchLabel")}
          criteriaLabel={t("common.searchByCriteria")}
          criteria={criteria}
          searchBy={searchBy}
          searchTerm={searchValue}
          onSearchByChange={onSearchByChange}
          onSearchTermChange={onSearchChange}
          className="min-w-0 flex-1"
        />
        <Button
          variant="outline"
          color="standard"
          size="medium"
          className="!mt-1.5 !h-11 shrink-0 !rounded-lg px-3"
          disabled={!canResetFilters}
          onClick={onResetFilters}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t("courseGroupStudent.filter.reset")}
        </Button>
      </div>

      {pagination.total > 0 ? (
        <>
          <div className="bg-background-body-background/30 text-caption hidden border-b border-other-divider px-5 py-3 font-semibold uppercase tracking-wide text-text-secondary sm:grid sm:grid-cols-[2rem_minmax(10rem,1fr)_auto_2.5rem] sm:px-6 lg:grid-cols-[3rem_minmax(13rem,1fr)_10rem_7rem_10rem_2.5rem]">
            <span aria-hidden="true" />
            <span>{t("courseGroupStudent.table.fullName")}</span>
            <span className="lg:col-start-3">
              {t("courseGroupStudent.table.studentCode")}
            </span>
            <span className="hidden lg:block">
              {t("courseGroupStudent.table.gender")}
            </span>
            <span className="hidden lg:block">
              {t("courseGroupStudent.table.dateOfBirth")}
            </span>
            <span aria-hidden="true" />
          </div>
          <ul className="divide-y divide-other-divider">
            {currentStudents.map((student) => (
              <li
                key={student.id}
                className="hover:bg-background-body-background/40 grid grid-cols-[2rem_minmax(0,1fr)_2.5rem] items-center gap-3 px-4 py-3.5 transition-colors sm:grid-cols-[2rem_minmax(10rem,1fr)_auto_2.5rem] sm:px-6 lg:grid-cols-[3rem_minmax(13rem,1fr)_10rem_7rem_10rem_2.5rem]"
              >
                <span className="font-mono text-xs font-medium text-text-disabled">
                  {String(student.stt).padStart(2, "0")}
                </span>
                <div className="flex min-w-0 items-center gap-3">
                  <IdentityAvatar
                    name={student.fullName}
                    avatarUrl={student.avatarUrl}
                    size="medium"
                    className="border border-other-divider"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {student.fullName}
                    </p>
                    <p className="text-caption truncate text-text-secondary">
                      {student.email}
                    </p>
                    <span className="mt-1 inline-flex rounded-md bg-background-body-background px-2 py-0.5 font-mono text-xs font-medium text-text-secondary sm:hidden">
                      {student.studentCode}
                    </span>
                  </div>
                </div>
                <span className="hidden rounded-md bg-background-body-background px-2.5 py-1 font-mono text-xs font-medium text-text-primary sm:inline-flex sm:w-fit">
                  {student.studentCode}
                </span>
                <span className="hidden text-sm text-text-secondary lg:block">
                  {student.gender}
                </span>
                <span className="hidden text-sm text-text-secondary lg:block">
                  {formatDateOfBirth(student.dateOfBirth)}
                </span>
                {canRemoveStudent ? (
                  <Button
                    isButtonIcon
                    size="small"
                    color="error"
                    variant="text"
                    tooltip={t("courseGroupStudent.delete")}
                    aria-label={t("courseGroupStudent.delete")}
                    className="text-text-secondary"
                    disabled={isRemovingStudent}
                    onClick={() => onRemoveStudent(student)}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </Button>
                ) : (
                  <span aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
          {pagination.total > pagination.pageSize && (
            <div className="flex flex-col gap-3 border-t border-other-divider px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span className="text-caption text-text-secondary">
                {t("pagination.showTotal", {
                  start: (
                    (pagination.current - 1) * pagination.pageSize +
                    1
                  ).toLocaleString(i18n.language),
                  end: Math.min(
                    pagination.current * pagination.pageSize,
                    pagination.total
                  ).toLocaleString(i18n.language),
                  total: pagination.total.toLocaleString(i18n.language),
                })}
              </span>
              <AntPagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={pagination.onChange}
                showSizeChanger={false}
                showTitle={false}
                size="small"
              />
            </div>
          )}
        </>
      ) : (
        <div className="px-5 py-12">
          <Empty
            description={
              searchValue.trim()
                ? t("courseGroupStudent.noMatchingStudents")
                : t("courseGroupStudent.noStudents")
            }
          />
        </div>
      )}
    </section>
  );
}
