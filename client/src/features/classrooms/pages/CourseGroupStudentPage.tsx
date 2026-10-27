import { Alert, Spin } from "antd";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  PermissionDeniedAlert,
  QueryErrorAlert,
} from "@/shared/components/ui";
import CourseGroupStudentForm from "@/features/classrooms/components/CourseRosterForm";
import CourseGroupInviteCodeDialog from "@/features/classrooms/components/CourseGroupInviteCodeDialog";
import CourseGroupStudentTable from "@/features/classrooms/components/CourseGroupStudentTable";
import CourseGroupRosterHeader from "@/features/classrooms/components/CourseGroupRosterHeader";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { useCourseGroupRosterController } from "@/features/classrooms/hooks/useCourseGroupRosterController";

export function CourseGroupStudentPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const {
    parsedGroupId,
    isValidGroupId,
    courseGroup,
    students,
    studentCount,
    searchValue,
    searchBy,
    canResetFilters,
    handleSearchChange,
    handleSearchByChange,
    resetStudentFilters,
    isAddStudentOpen,
    isInviteCodeOpen,
    openAddStudentDialog,
    closeAddStudentDialog,
    openInviteCodeDialog,
    closeInviteCodeDialog,
    canView,
    canAddStudent,
    canRemoveStudent,
    canUpdateInviteCode,
    classTitle,
    subjectName,
    isLoading,
    isError,
    isFetching,
    message,
    isExporting,
    pagination,
    isRemovingStudent,
    handleExportStudentList,
    handleRemoveStudent,
    retryLoading,
  } = useCourseGroupRosterController(groupId);

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <div className="flex w-full flex-col gap-3">
        <Button
          variant="outline"
          size="medium"
          className="!h-10 w-fit !rounded-lg px-3.5"
          onClick={() => navigate("/course-group")}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t("courseGroupStudent.backToClasses")}
        </Button>
        <section className="flex w-full flex-col gap-5 lg:gap-6">
          {!isValidGroupId && (
            <Alert
              type="error"
              showIcon
              message={t("courseGroupStudent.invalidClass")}
            />
          )}

          {isLoading && isValidGroupId && (
            <div className="flex items-center justify-center py-16">
              <Spin size="large" tip={t("courseGroupStudent.loading")} />
            </div>
          )}

          {!isLoading && isError && isValidGroupId && (
            <QueryErrorAlert
              message={t("courseGroupStudent.loadError")}
              description={message}
              retryLabel={t("courseGroupStudent.retry")}
              onRetry={retryLoading}
              isRetrying={isFetching}
            />
          )}

          {!isLoading && !isError && !canView && isValidGroupId && (
            <PermissionDeniedAlert
              message={t("courseGroupStudent.noViewPermission")}
            />
          )}

          {!isLoading && !isError && canView && (
            <>
              <CourseGroupRosterHeader
                classTitle={classTitle}
                subjectName={subjectName}
                teacherName={
                  courseGroup?.teacher?.profile.fullName ||
                  courseGroup?.teacher?.username ||
                  t("courseGroup.teacherUnavailable")
                }
                academicYear={courseGroup?.academicYear ?? "—"}
                semester={courseGroup?.semester ?? "—"}
                studentCount={studentCount}
                isExporting={isExporting}
                canManageInvite={canUpdateInviteCode}
                onExport={handleExportStudentList}
                onManageInvite={openInviteCodeDialog}
              />

              <CourseGroupStudentTable
                students={students}
                searchValue={searchValue}
                searchBy={searchBy}
                canResetFilters={canResetFilters}
                canAddStudent={canAddStudent}
                canRemoveStudent={canRemoveStudent}
                isRemovingStudent={isRemovingStudent}
                onSearchChange={handleSearchChange}
                onSearchByChange={handleSearchByChange}
                onResetFilters={resetStudentFilters}
                onAddStudent={openAddStudentDialog}
                onRemoveStudent={handleRemoveStudent}
                pagination={pagination}
              />
            </>
          )}
        </section>
      </div>

      {canView && canAddStudent && isAddStudentOpen && courseGroup && (
        <CourseGroupStudentForm
          isOpen
          onClose={closeAddStudentDialog}
          courseLabel={classTitle}
          groupId={parsedGroupId}
        />
      )}
      {canView && canUpdateInviteCode && isInviteCodeOpen && courseGroup && (
        <CourseGroupInviteCodeDialog
          isOpen
          onClose={closeInviteCodeDialog}
          courseLabel={classTitle}
          groupId={parsedGroupId}
          inviteCode={courseGroup.joinCode}
        />
      )}
    </MainContentLayout>
  );
}
