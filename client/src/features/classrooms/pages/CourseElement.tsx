import { Spin } from "antd";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { QueryErrorAlert } from "@/shared/components/ui";
import Tabs from "@/shared/components/ui/Tabs/Tabs";
import ExamResultModal from "@/features/assessments/components/exam/ExamResultModal";
import CourseGroupMaterials from "@/features/classrooms/components/CourseGroupMaterials";
import CoursePeopleTab from "@/features/classrooms/components/CoursePeopleTab";
import CourseGroupStreamTab from "@/features/classrooms/components/CourseGroupStreamTab";
import CourseGroupClassworkTab from "@/features/classrooms/components/CourseGroupClassworkTab";
import CourseGroupGradebookTab from "@/features/classrooms/components/CourseGroupGradebookTab";
import { useCourseElementController } from "@/features/classrooms/hooks/useCourseElementController";
import { useTranslation } from "react-i18next";

const HERO_COLORS = ["#536d79", "#1b8e83", "#3673d9", "#ec8067", "#7054ad"];

export default function CourseElement() {
  const { t } = useTranslation();
  const {
    selectedTab,
    setSelectedTab,
    now,
    courseGroupId,
    isValidCourseGroupId,
    courseGroup,
    isCourseGroupLoading,
    isCourseGroupFetching,
    isCourseGroupError,
    refetchCourseGroup,
    students,
    teacher,
    isStudent,
    isTeacher,
    canViewGrades,
    canPreviewExam,
    canViewMaterials,
    canCreateMaterials,
    canUpdateMaterials,
    canDeleteMaterials,
    canCreateAnnouncement,
    canCreateExam,
    canDeleteAnnouncement,
    isStudentExamsLoading,
    isStudentExamsFetching,
    isStudentExamsError,
    isResultModalOpen,
    closeResultModal,
    handleStartExam,
    handleViewResult,
    handlePreviewExam,
    combinedFeed,
    sortedClasswork,
    nearestUpcomingExam,
    isAnnouncementFormOpen,
    toggleAnnouncementForm,
    closeAnnouncementForm,
    handleSaveCreate,
    handleDeleteAnnouncement,
    handleCreateExam,
    handleCopyJoinCode,
    retryStudentExams,
  } = useCourseElementController();

  if (isCourseGroupLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f8f9fa] dark:bg-background-body-background">
        <Spin size="large" tip={t("courseElement.loadingClass")} />
      </main>
    );
  }

  if (!isValidCourseGroupId || isCourseGroupError || !courseGroup) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-start px-4 py-8">
        <QueryErrorAlert
          className="w-full"
          message={
            isValidCourseGroupId
              ? t("courseElement.loadClassError")
              : t("courseElement.invalidClassId")
          }
          onRetry={isValidCourseGroupId ? refetchCourseGroup : undefined}
          isRetrying={isCourseGroupFetching}
          retryLabel={t("courseElement.retry")}
        />
      </main>
    );
  }

  const heroColor = HERO_COLORS[courseGroup.id % HERO_COLORS.length];
  const visibleTabs = [
    { value: "news", label: t("courseElement.tabs.news") },
    { value: "classwork", label: t("courseElement.tabs.classwork") },
    { value: "everybody", label: t("courseElement.tabs.everybody") },
    ...(canViewGrades
      ? [{ value: "grades", label: t("courseElement.tabs.grades") }]
      : []),
    ...(canViewMaterials
      ? [{ value: "materials", label: t("courseElement.tabs.materials") }]
      : []),
  ];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1480px] flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <Link
        to="/courses"
        className="mb-4 inline-flex w-fit items-center gap-2 text-sm text-[#5f6368] hover:text-[#1a73e8] dark:text-text-secondary"
      >
        <ArrowLeft size={17} />
        {t("coursePage.title")}
      </Link>

      <section
        className="relative flex min-h-[180px] items-end overflow-hidden rounded-3xl px-6 py-7 text-white sm:min-h-[220px] sm:px-9 sm:py-8"
        style={{ backgroundColor: heroColor }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-5 -top-24 h-72 w-72 rotate-12 rounded-[3rem] border-[28px] border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full border-[24px] border-black/10"
        />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-2 text-sm font-medium text-white/80">
            {courseGroup.subject?.subjectName ?? t("coursePage.workspaceLabel")}
          </p>
          <h1 className="line-clamp-2 text-3xl font-normal leading-tight sm:text-4xl">
            {courseGroup.groupName}
          </h1>
          <p className="mt-2 text-sm text-white/85">
            {t("courseItem.academicInfo", {
              year: courseGroup.academicYear,
              semester: courseGroup.semester,
            })}
          </p>
        </div>
      </section>

      <div className="sticky top-0 z-30 mt-5 flex items-center justify-between border-b border-[#dadce0] bg-background-body-background dark:border-other-divider">
        <Tabs
          value={selectedTab}
          onChange={setSelectedTab}
          tabs={visibleTabs}
          className="flex-1 [&_.ant-tabs-tab]:!px-4 sm:[&_.ant-tabs-tab]:!px-6"
        />
        <div className="hidden items-center gap-2 pb-1 text-[#5f6368] dark:text-text-secondary sm:flex">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full"
            title={t("courseElement.people.classmates")}
          >
            <CalendarDays size={19} />
          </span>
        </div>
      </div>

      <main className="min-w-0">
        {selectedTab === "news" && (
          <CourseGroupStreamTab
            courseGroupId={courseGroupId}
            isTeacher={isTeacher}
            joinCode={courseGroup.joinCode}
            nearestUpcomingExam={nearestUpcomingExam}
            feedItems={combinedFeed}
            canCreateAnnouncement={canCreateAnnouncement}
            isAnnouncementFormOpen={isAnnouncementFormOpen}
            canDeleteAnnouncement={canDeleteAnnouncement}
            onViewClasswork={() => setSelectedTab("classwork")}
            onCopyJoinCode={handleCopyJoinCode}
            onToggleAnnouncementForm={toggleAnnouncementForm}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onCloseAnnouncementForm={closeAnnouncementForm}
            onSaveAnnouncement={handleSaveCreate}
          />
        )}

        {selectedTab === "classwork" && (
          <CourseGroupClassworkTab
            exams={sortedClasswork}
            isStudent={isStudent}
            isTeacher={isTeacher}
            canCreateExam={canCreateExam}
            canPreviewExam={canPreviewExam}
            now={now}
            isLoading={isStudentExamsLoading}
            isFetching={isStudentExamsFetching}
            isError={isStudentExamsError}
            onCreateExam={handleCreateExam}
            onPreviewExam={handlePreviewExam}
            onStartExam={handleStartExam}
            onViewResult={handleViewResult}
            onRetry={retryStudentExams}
          />
        )}

        {selectedTab === "materials" && canViewMaterials && (
          <CourseGroupMaterials
            courseGroupId={courseGroup.id}
            canCreate={canCreateMaterials}
            canUpdate={canUpdateMaterials}
            canDelete={canDeleteMaterials}
          />
        )}

        {selectedTab === "everybody" && (
          <CoursePeopleTab teacher={teacher} students={students} />
        )}

        {selectedTab === "grades" && canViewGrades && (
          <CourseGroupGradebookTab
            courseGroupId={courseGroup.id}
            joinCode={courseGroup.joinCode}
            studentCount={students.length}
            exams={sortedClasswork}
            now={now}
            canCreateExam={canCreateExam}
            onCreateExam={handleCreateExam}
            onCopyJoinCode={handleCopyJoinCode}
          />
        )}

        {isResultModalOpen && <ExamResultModal onClose={closeResultModal} />}
      </main>
    </div>
  );
}
