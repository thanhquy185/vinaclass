import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import { PermissionDeniedAlert, QueryErrorAlert } from "@/shared/components/ui";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import StudentTasksWorkspace from "@/features/assessments/components/StudentTasksWorkspace";
import { useExamPageController } from "@/features/assessments/hooks/useExamPageController";

export const ExamPage = () => {
  const { t } = useTranslation();
  const {
    permission,
    canViewExams,
    examQuery,
    examActions,
    handleRetryExamData,
    handleStartExam,
  } = useExamPageController();
  const {
    isLoading: isPermissionLoading,
    isFetching: isPermissionFetching,
    isError: isPermissionError,
    refetch: refetchPermissions,
  } = permission;
  const {
    isLoading: isExamsLoading,
    isFetching: isExamsFetching,
    isError: isExamsError,
    error: examsError,
  } = examQuery;
  const { isFetchingExamAttempts } = examActions;

  if (isPermissionLoading) {
    return (
      <MainContentLayout className="w-full">
        <div className="flex min-h-48 items-center justify-center">
          <Spin tip={t("examPage.permissionLoading")} />
        </div>
      </MainContentLayout>
    );
  }

  if (isPermissionError) {
    return (
      <MainContentLayout className="w-full">
        <QueryErrorAlert
          message={t("examPage.permissionLoadError")}
          retryLabel={t("examPage.retry")}
          onRetry={refetchPermissions}
          isRetrying={isPermissionFetching}
        />
      </MainContentLayout>
    );
  }

  if (!canViewExams) {
    return (
      <MainContentLayout className="w-full">
        <PermissionDeniedAlert message={t("examPage.noViewPermission")} />
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" hasFooter={false} className="!gap-0 !pt-0">
      <StudentTasksWorkspace
        exams={examQuery.exams}
        attempts={examActions.examAttempts}
        isLoading={isExamsLoading}
        isFetching={isExamsFetching || isFetchingExamAttempts}
        isError={isExamsError}
        error={examsError}
        onRetry={handleRetryExamData}
        onStartExam={handleStartExam}
      />
    </MainContentLayout>
  );
};
