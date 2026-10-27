import { Alert, Button as AntButton, Form, Spin } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FilePlus2,
  PencilLine,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import TestFormFields from "@/features/assessments/components/TestFormFields";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { QueryErrorAlert } from "@/shared/components/ui/QueryErrorAlert/QueryErrorAlert";
import ExamSettingsSidebar from "@/features/assessments/components/ExamSettingsSidebar";
import { useTestFormPageController } from "@/features/assessments/hooks/useTestFormPageController";
import { AdminPanel } from "@/shared/components/admin";
import { Button } from "@/shared/components/ui";
import { AssessmentPageHeader } from "@/features/assessments/components/AssessmentPageHeader";

export default function TestFormPage() {
  const { t } = useTranslation();
  const {
    navigate,
    roleKind,
    isEditMode,
    isViewMode,
    isAddMode,
    isPersistedExamMode,
    isValidExamId,
    permission,
    subjects,
    examQuery,
    form: formController,
  } = useTestFormPageController();
  const { isPermissionNavigationEnabled } = permission;
  const {
    isFetchingAllSubjects: isFetchingSubjects,
    isAllSubjectsError: isSubjectsError,
    refetchAllSubjects: refetchSubjects,
    isFetchingTeacherSubjects,
    isTeacherSubjectsError,
    refetchTeacherSubjects,
  } = subjects;
  const {
    exam,
    isLoading: isLoadingExam,
    isFetching: isFetchingExam,
    isError: isExamError,
    refetch: refetchExam,
  } = examQuery;
  const {
    testData,
    updateConfiguration,
    form,
    creatorError,
    availableSubjects,
    groupOptions,
    isLoadingCourseGroups,
    isCourseGroupsError,
    refetchCourseGroups,
    isLoadingSubjectOptions,
    canAssignCourseGroups,
    validateTestField,
    handleFormValuesChange,
    handleContinue,
  } = formController;
  const formExamName = Form.useWatch("examName", form);
  const displayedTestData = isViewMode ? (exam ?? testData) : testData;
  const displayedExamName =
    formExamName?.trim() || testData?.examName?.trim() || undefined;

  if (isPersistedExamMode && !isValidExamId) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          showIcon
          message={t("testFormPage.notFound")}
          action={
            <AntButton
              variant="outlined"
              size="small"
              onClick={() => navigate("/tests")}
            >
              {t("testFormPage.actions.backToList")}
            </AntButton>
          }
        />
      </div>
    );
  }

  if (isLoadingExam && isPersistedExamMode) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spin tip={t("tableActions.loading")} />
      </div>
    );
  }

  if (isExamError && isPersistedExamMode) {
    return (
      <div className="p-6">
        <QueryErrorAlert
          message={t("testFormPage.loadError")}
          onRetry={refetchExam}
          isRetrying={isFetchingExam}
          retryLabel={t("testFormPage.actions.retry")}
        />
      </div>
    );
  }

  if (isPersistedExamMode && !exam) {
    return (
      <div className="p-6">
        <Alert
          type="warning"
          showIcon
          message={t("testFormPage.notFound")}
          action={
            <AntButton
              variant="outlined"
              size="small"
              onClick={() => navigate("/tests")}
            >
              {t("testFormPage.actions.backToList")}
            </AntButton>
          }
        />
      </div>
    );
  }

  const pageMode = isEditMode ? "edit" : isViewMode ? "view" : "create";
  const pageIcon = isEditMode ? (
    <PencilLine size={21} aria-hidden="true" />
  ) : isViewMode ? (
    <ClipboardList size={21} aria-hidden="true" />
  ) : (
    <FilePlus2 size={21} aria-hidden="true" />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MainContentLayout
          width="wide"
          hasFooter={false}
          className="!max-w-[1560px] !gap-5"
        >
          <AssessmentPageHeader
            title={
              !isViewMode && displayedExamName
                ? displayedExamName
                : t(`testFormPage.title.${pageMode}`)
            }
            description={t(`testFormPage.description.${pageMode}`)}
            icon={pageIcon}
            badge={
              isEditMode && testData?.id ? (
                <span className="rounded-full bg-action-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
                  {t("testItem.examCode", { id: testData.id })}
                </span>
              ) : undefined
            }
          />

          {isTeacherSubjectsError && (
            <QueryErrorAlert
              message={t("testFormPage.subjectsLoadError")}
              onRetry={refetchTeacherSubjects}
              isRetrying={isFetchingTeacherSubjects}
              retryLabel={t("testFormPage.actions.retry")}
            />
          )}
          {(roleKind === "ADMIN" || roleKind === "CUSTOM") &&
            isSubjectsError && (
              <QueryErrorAlert
                message={t("testFormPage.allSubjectsLoadError")}
                onRetry={refetchSubjects}
                isRetrying={isFetchingSubjects}
                retryLabel={t("testFormPage.actions.retry")}
              />
            )}
          {creatorError && (
            <Alert type="error" showIcon message={t(creatorError)} />
          )}

          <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <TestFormFields
                form={form}
                testData={displayedTestData}
                availableSubjects={availableSubjects}
                groupOptions={groupOptions}
                isLoadingCourseGroups={isLoadingCourseGroups}
                isCourseGroupsError={isCourseGroupsError}
                refetchCourseGroups={refetchCourseGroups}
                isViewMode={isViewMode}
                isEditMode={isEditMode}
                isLoadingSubjectOptions={isLoadingSubjectOptions}
                isPermissionNavigationEnabled={isPermissionNavigationEnabled}
                canAssignCourseGroups={canAssignCourseGroups}
                validateTestField={validateTestField}
                onValuesChange={handleFormValuesChange}
              />
            </div>

            <ExamSettingsSidebar
              data={displayedTestData?.examConfiguration}
              readOnly={isViewMode}
              onChange={updateConfiguration}
            />
          </div>

          <AdminPanel className="sticky bottom-3 z-20 flex flex-wrap justify-end gap-2 border-t border-other-divider p-3 shadow-lg sm:p-4">
            <Button
              variant="outline"
              size="medium"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t("testFormPage.actions.back")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleContinue}
              disabled={
                isAddMode &&
                isPermissionNavigationEnabled &&
                !canAssignCourseGroups
              }
            >
              {isViewMode ? (
                <ClipboardList size={16} aria-hidden="true" />
              ) : (
                <ArrowRight size={16} aria-hidden="true" />
              )}
              {isViewMode
                ? t("testFormPage.actions.viewQuestions")
                : t(
                    `testFormPage.actions.${isEditMode ? "continueEditQuestions" : "continueQuestions"}`
                  )}
            </Button>
          </AdminPanel>
        </MainContentLayout>
      </div>
    </div>
  );
}
