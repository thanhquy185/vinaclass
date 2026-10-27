import { Alert, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { Button, QueryErrorAlert } from "@/shared/components/ui";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import TestDetailContent from "@/features/assessments/components/TestDetailContent";
import { useTestDetailPageController } from "@/features/assessments/hooks/useTestDetailPageController";

export default function TestDetailPage() {
  const { t } = useTranslation();
  const {
    examQuery: { isLoading, isFetching, isError, refetch },
    displayData,
    actions: {
      handlePreview,
      handleEdit,
      handleView,
      handleDelete,
      handleBackToList,
    },
  } = useTestDetailPageController();

  if (isLoading) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <div className="flex min-h-48 items-center justify-center rounded-md bg-background-body-background">
          <Spin tip={t("testDetailPage.loading")} />
        </div>
      </MainContentLayout>
    );
  }

  if (!displayData) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        {isError ? (
          <QueryErrorAlert
            message={t("testDetailPage.loadError")}
            retryLabel={t("testDetailPage.actions.retry")}
            onRetry={refetch}
            isRetrying={isFetching}
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message={t("testDetailPage.notFound")}
            action={
              <Button variant="outline" size="small" onClick={handleBackToList}>
                {t("testDetailPage.actions.backToList")}
              </Button>
            }
          />
        )}
      </MainContentLayout>
    );
  }

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
        {isError && (
          <QueryErrorAlert
            type="warning"
            message={t("testDetailPage.loadErrorWithData")}
            retryLabel={t("testDetailPage.actions.retry")}
            onRetry={refetch}
            isRetrying={isFetching}
          />
        )}
        <TestDetailContent
          examName={displayData.examName}
          subjectName={displayData.subject?.subjectName}
          startTime={displayData.startTime}
          endTime={displayData.endTime}
          durationMinutes={displayData.durationMinutes}
          questionCount={displayData.questions?.length ?? 0}
          courseGroups={displayData.courseGroups}
          examId={displayData.id || 0}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>
    </MainContentLayout>
  );
}
