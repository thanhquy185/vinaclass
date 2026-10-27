import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty, Input, Spin } from "antd";
import { ArrowUpDown, Plus, RotateCcw, Search, UsersRound } from "lucide-react";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import { AdminFilterField } from "@/shared/components/admin/AdminFilterField";
import SelectField from "@/shared/components/ui/Select/SelectField";
import CourseItem from "@/features/classrooms/components/CourseCard";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { JoinClassForm } from "@/features/classrooms/components/JoinClassForm";
import { CourseGroupForm } from "@/features/classrooms/components/CourseGroupForm";
import { useClassroomPageController } from "@/features/classrooms/hooks/useClassroomPageController";

export const CoursePage = () => {
  const { t, i18n } = useTranslation();
  const controller = useClassroomPageController();
  const {
    canBrowseClassrooms,
    isStudent,
    isTeacher,
    canCreateGroup,
    isCourseGroupFormOpen,
    isCourseGroupFormProcessing,
    openCreateCourseGroupForm,
    closeCourseGroupForm,
    saveCourseGroupForm,
    currentUserName,
    isOpenModal,
    showHiddenClasses,
    searchValue,
    resetFilters,
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
    setActivePage,
    hiddenPage,
    hiddenTotalPages,
    hiddenPageGroups,
    setHiddenPage,
    upcomingItems,
    studentExamLoading,
  } = controller;

  const courseCountLabel = useMemo(
    () =>
      t("coursePage.classCount", {
        count: activeCourseGroups.length,
      }),
    [activeCourseGroups.length, t]
  );
  const hasActiveFilters =
    Boolean(searchValue.trim()) ||
    subjectFilter !== "all" ||
    academicYearFilter !== "all" ||
    semesterFilter !== "all";

  if (!canBrowseClassrooms) {
    return (
      <MainContentLayout width="wide" hasFooter={false}>
        <PermissionDeniedAlert message={t("coursePage.noAccess")} />
      </MainContentLayout>
    );
  }

  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const allSubjectOption = {
    value: "all",
    label: t("coursePage.filterAllSubjects"),
  };
  const allAcademicYearOption = {
    value: "all",
    label: t("coursePage.filterAllAcademicYears"),
  };
  const allSemesterOption = {
    value: "all",
    label: t("coursePage.filterAllSemesters"),
  };

  return (
    <MainContentLayout width="wide" hasFooter={false} className="!gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 px-1 pt-1">
        <div>
          <h1 className="text-h4 font-semibold tracking-tight text-text-primary">
            {t("coursePage.title")}
          </h1>
          <p className="text-body-2 mt-1 text-text-secondary">
            {t(
              isTeacher
                ? "coursePage.teacherSubtitle"
                : "coursePage.studentSubtitle"
            )}
          </p>
        </div>

        {isStudent ? (
          <Button
            type="primary"
            size="large"
            icon={<Plus size={18} />}
            className="!rounded-lg !bg-primary-main !px-5 !shadow-none hover:!bg-primary-dark"
            onClick={controller.openJoinClassModal}
          >
            {t("coursePage.joinNewClass")}
          </Button>
        ) : canCreateGroup ? (
          <Button
            size="large"
            icon={<Plus size={18} />}
            className="!rounded-lg !border-primary-main !bg-primary-main !px-5 !text-primary-contrast hover:!border-primary-dark hover:!bg-primary-dark"
            onClick={openCreateCourseGroupForm}
          >
            {t("coursePage.createClass")}
          </Button>
        ) : null}
      </header>

      {isError ? (
        <QueryErrorAlert
          message={t("coursePage.loadError")}
          retryLabel={t("coursePage.retry")}
          onRetry={refetch}
          isRetrying={isFetching}
          retryButtonVariant="link"
        />
      ) : (
        <>
          <section className="rounded-xl border border-other-outlined-border bg-background-paper px-5 py-5 shadow-sm sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-h6 font-semibold text-text-primary">
                {t("coursePage.upcomingTitle")}
              </h2>
              <Link
                to={isStudent ? "/exams" : "/tests"}
                className="text-body-2 font-medium text-primary-main hover:underline"
              >
                {t("coursePage.viewTasks")}
              </Link>
            </div>

            {studentExamLoading && isStudent ? (
              <div className="flex min-h-16 items-center justify-center">
                <Spin size="small" />
              </div>
            ) : upcomingItems.length > 0 ? (
              <div className="divide-y divide-[#e8eaed] dark:divide-other-divider">
                {upcomingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-custom-background-primary-background text-primary-main">
                      <UsersRound size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-text-secondary">
                        {item.courseName}
                      </p>
                    </div>
                    <time className="text-sm text-text-secondary">
                      {new Date(item.endTime).toLocaleString(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-3 text-sm text-text-secondary">
                {t("coursePage.noUpcoming")}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-other-outlined-border bg-background-paper px-5 py-5 shadow-sm sm:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-normal text-[#202124] dark:text-text-primary">
                  {t(isTeacher ? "coursePage.teaching" : "coursePage.enrolled")}
                </h2>
                <span className="rounded-full bg-primary-background px-3 py-1 text-xs font-medium text-primary-main">
                  {courseCountLabel}
                </span>
              </div>

              <div className="flex w-full flex-wrap items-end gap-2 lg:w-auto">
                <AdminFilterField
                  label={t("coursePage.searchLabel")}
                  htmlFor="course-group-search"
                  className="min-w-[170px] flex-1 lg:w-[11rem] lg:flex-none"
                >
                  <Input
                    id="course-group-search"
                    allowClear
                    className="!h-11 min-w-0 !rounded-xl"
                    aria-label={t("coursePage.searchLabel")}
                    placeholder={t("coursePage.searchPlaceholder")}
                    prefix={<Search size={17} className="text-[#80868b]" />}
                    value={searchValue}
                    onChange={(event) =>
                      controller.handleSearchChange(event.target.value)
                    }
                  />
                </AdminFilterField>

                {isTeacher && (
                  <>
                    <SelectField
                      label={t("coursePage.filterSubjectLabel")}
                      placeholder={t("coursePage.filterSubjectLabel")}
                      className="min-w-40 flex-1 lg:w-[11rem] lg:flex-none"
                      value={subjectFilter}
                      options={[
                        allSubjectOption,
                        ...subjects.map((subject) => ({
                          value: String(subject.id),
                          label: `${subject.subjectCode} · ${subject.subjectName}`,
                        })),
                      ]}
                      onSelect={(value) =>
                        controller.handleSubjectChange(String(value))
                      }
                    />
                    <SelectField
                      label={t("coursePage.filterAcademicYearLabel")}
                      placeholder={t("coursePage.filterAcademicYearLabel")}
                      className="min-w-36 flex-1 lg:w-[10.5rem] lg:flex-none"
                      value={academicYearFilter}
                      options={[
                        allAcademicYearOption,
                        ...academicYears.map((year) => ({
                          value: String(year),
                          label: t("coursePage.academicYearOption", { year }),
                        })),
                      ]}
                      onSelect={(value) =>
                        controller.handleAcademicYearChange(String(value))
                      }
                    />
                    <SelectField
                      label={t("coursePage.filterSemesterLabel")}
                      placeholder={t("coursePage.filterSemesterLabel")}
                      className="min-w-32 flex-1 lg:w-40 lg:flex-none"
                      value={semesterFilter}
                      options={[
                        allSemesterOption,
                        ...[1, 2, 3].map((semester) => ({
                          value: String(semester),
                          label: t("coursePage.semesterOption", { semester }),
                        })),
                      ]}
                      onSelect={(value) =>
                        controller.handleSemesterChange(String(value))
                      }
                    />
                  </>
                )}

                <Button
                  aria-label={t("coursePage.resetFilters")}
                  title={t("coursePage.resetFilters")}
                  disabled={!hasActiveFilters}
                  icon={<RotateCcw size={16} />}
                  className="order-2 !h-10 !w-10 !shrink-0 !rounded-xl"
                  onClick={resetFilters}
                />

                <Button
                  aria-label={t(
                    sortDirection === "asc"
                      ? "coursePage.sortDescending"
                      : "coursePage.sortAscending"
                  )}
                  title={t(
                    sortDirection === "asc"
                      ? "coursePage.sortDescending"
                      : "coursePage.sortAscending"
                  )}
                  icon={<ArrowUpDown size={17} />}
                  className="order-1 !h-10 !w-10 !shrink-0 !rounded-xl"
                  onClick={controller.toggleSortDirection}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center">
                <Spin size="large" tip={t("coursePage.loading")} />
              </div>
            ) : activeCourseGroups.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 py-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {activePageGroups.map((group) => (
                  <CourseItem
                    key={group.id}
                    data={group}
                    currentUserName={isTeacher ? currentUserName : undefined}
                    isTeacher={isTeacher}
                  />
                ))}
              </div>
            ) : (
              <Empty
                className="my-12"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchValue.trim() ||
                  subjectFilter !== "all" ||
                  academicYearFilter !== "all" ||
                  semesterFilter !== "all"
                    ? t("coursePage.noFilteredClasses")
                    : t(
                        isTeacher
                          ? "coursePage.noTeachingClasses"
                          : "coursePage.noClasses"
                      )
                }
              >
                {isStudent && activeCourseGroups.length === 0 && (
                  <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={controller.openJoinClassModal}
                  >
                    {t("coursePage.joinNewClass")}
                  </Button>
                )}
              </Empty>
            )}

            {activeCourseGroups.length > 0 && (
              <Pagination
                currentPage={activePage}
                totalPages={activeTotalPages}
                onPageChange={setActivePage}
              />
            )}
          </section>

          <section className="rounded-3xl bg-white px-5 py-5 shadow-[0_1px_3px_rgba(60,64,67,.12)] dark:bg-background-paper sm:px-7">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-h6 font-semibold text-text-primary">
                {t("coursePage.archivedClasses")}
              </h2>
              <Button type="link" onClick={controller.toggleHiddenClasses}>
                {t(
                  showHiddenClasses
                    ? "coursePage.hideHiddenClasses"
                    : "coursePage.showHiddenClasses"
                )}
              </Button>
            </div>

            {showHiddenClasses && (
              <>
                {hiddenCourseGroups.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 py-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {hiddenPageGroups.map((group) => (
                      <CourseItem
                        key={group.id}
                        data={group}
                        currentUserName={
                          isTeacher ? currentUserName : undefined
                        }
                        isTeacher={isTeacher}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    className="my-8"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("coursePage.noHiddenClasses")}
                  />
                )}
                {hiddenCourseGroups.length > 0 && (
                  <Pagination
                    currentPage={hiddenPage}
                    totalPages={hiddenTotalPages}
                    onPageChange={setHiddenPage}
                  />
                )}
              </>
            )}
          </section>
        </>
      )}

      {isOpenModal && (
        <JoinClassForm
          onCancel={controller.closeJoinClassModal}
          onSubmit={controller.handleJoinClass}
          isSubmitting={isJoining}
        />
      )}
      {isCourseGroupFormOpen && (
        <CourseGroupForm
          isSubmitting={isCourseGroupFormProcessing}
          onCancel={closeCourseGroupForm}
          onSave={saveCourseGroupForm}
        />
      )}
    </MainContentLayout>
  );
};
