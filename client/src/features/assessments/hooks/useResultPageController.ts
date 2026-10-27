import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import {
  getAuthenticatedRoleKind,
  getAuthenticatedUserRoleCode,
} from "@/shared/utils/role";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { getTestsStatus } from "@/features/assessments/utils/exam";
import {
  useCourseGroupDetail,
  useCourseGroupStudents,
} from "@/features/classrooms/hooks/useCourseGroupQueries";
import { useDifficultyQueries } from "@/features/catalogs/hooks/useDifficultyQueries";
import { useExamActions } from "@/features/assessments/hooks/useExamActions";
import { useExamDetail } from "@/features/assessments/hooks/useExamQueries";
import { useExamResultActions } from "@/features/assessments/hooks/useExamResultActions";
import { useResultTableState } from "@/features/assessments/hooks/useResultTableState";
import { useParams } from "react-router-dom";

interface ResultQueryIssue {
  key: string;
  message: string;
  onRetry: () => Promise<unknown>;
  isRetrying: boolean;
}

export function useResultPageController() {
  const { t } = useTranslation();
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const roleKind = getAuthenticatedRoleKind(user, role);
  const classPermission = useFunctionActions("hoc_phan");
  const { id: rawExamId, courseGroupId: rawCourseGroupId } = useParams();
  const examId = Number(rawExamId) || 0;
  const courseGroupId = Number(rawCourseGroupId) || 0;

  const examQuery = useExamDetail(examId);
  const canLoadCustomGroupData =
    roleKind !== "CUSTOM" || classPermission.hasAction("view");
  const courseGroupQuery = useCourseGroupDetail(courseGroupId, {
    enabled: canLoadCustomGroupData,
  });
  const canViewGroupResults =
    roleCode === "ADMIN" ||
    (roleKind === "CUSTOM" && classPermission.hasAction("view")) ||
    (roleCode === "TEACHER" &&
      courseGroupQuery.courseGroup?.teacherId === user?.id);
  const studentQuery = useCourseGroupStudents(
    courseGroupId,
    canViewGroupResults
  );
  const examActions = useExamActions(courseGroupQuery.courseGroup?.id, examId, {
    canViewGroupResults,
  });
  const difficultyQuery = useDifficultyQueries();

  const resultTable = useResultTableState({
    students: studentQuery.students,
    examQuestions: examQuery.exam?.questions ?? [],
    examAttempts: examActions.examResults?.examAttempts ?? [],
    difficulties: difficultyQuery.difficulties,
    averageLabel: t("resultPage.classAverage"),
  });
  const { selectedTab, viewMode, studentRows, ...resultTableState } =
    resultTable;

  const shouldShowStudentDataStatus =
    selectedTab === "stat" ||
    (selectedTab === "classScore" && viewMode === "user");
  const shouldShowDifficultyDataStatus =
    selectedTab === "classScore" && viewMode !== "user";

  const queryIssues: ResultQueryIssue[] = [
    ...(examQuery.isError
      ? [
          {
            key: "exam",
            message: t("resultPage.loadExamError"),
            onRetry: () => examQuery.refetch(),
            isRetrying: examQuery.isFetching,
          },
        ]
      : []),
    ...(courseGroupQuery.isError
      ? [
          {
            key: "courseGroup",
            message: t("resultPage.loadCourseGroupError"),
            onRetry: () => courseGroupQuery.refetch(),
            isRetrying: courseGroupQuery.isFetching,
          },
        ]
      : []),
    ...(shouldShowStudentDataStatus &&
    canViewGroupResults &&
    studentQuery.isError
      ? [
          {
            key: "students",
            message: t("resultPage.loadStudentsError"),
            onRetry: () => studentQuery.refetch(),
            isRetrying: studentQuery.isFetching,
          },
        ]
      : []),
    ...(shouldShowStudentDataStatus &&
    canViewGroupResults &&
    examActions.isErrorExamResults
      ? [
          {
            key: "results",
            message: t("resultPage.loadResultError"),
            onRetry: () => examActions.refetchExamResults(),
            isRetrying: examActions.isFetchingExamResults,
          },
        ]
      : []),
    ...(shouldShowDifficultyDataStatus && difficultyQuery.isError
      ? [
          {
            key: "difficulties",
            message: t("resultPage.loadDifficultiesError"),
            onRetry: () => difficultyQuery.refetch(),
            isRetrying: difficultyQuery.isFetching,
          },
        ]
      : []),
  ];

  const isLoadingResultView =
    selectedTab === "classScore" &&
    (viewMode === "user"
      ? studentQuery.isLoading || examActions.isLoadingExamResults
      : difficultyQuery.isLoading);
  const isFetchingResultView =
    selectedTab === "classScore" &&
    (viewMode === "user"
      ? studentQuery.isFetching || examActions.isFetchingExamResults
      : difficultyQuery.isFetching);

  const exam = examQuery.exam;
  const courseGroup = courseGroupQuery.courseGroup;
  const status = getTestsStatus(exam?.startTime, exam?.endTime, new Date());
  const resultActions = useExamResultActions({
    examId,
    exam,
    reviewExam: examActions.reviewExam,
    viewMode,
    studentRows,
    exportMetadata: {
      subjectCode:
        exam?.subject?.subjectCode ||
        courseGroup?.subject?.subjectCode ||
        "---",
      subjectName:
        exam?.subject?.subjectName ||
        courseGroup?.subject?.subjectName ||
        "---",
      teacherCode:
        courseGroup?.teacher?.code ||
        exam?.creator?.code ||
        exam?.creator?.username ||
        "---",
      teacherName:
        courseGroup?.teacher?.profile.fullName ||
        exam?.creator?.profile.fullName ||
        "---",
      groupName: courseGroup?.groupName || "---",
      semester: courseGroup?.semester ?? "---",
      academicYear: courseGroup?.academicYear ?? "---",
    },
  });

  return {
    exam,
    courseGroup,
    students: studentQuery.students,
    examResults: examActions.examResults,
    isLoadingStudents: studentQuery.isLoading,
    isLoadingExamResults: examActions.isLoadingExamResults,
    isLoadingResultView,
    isFetchingResultView,
    queryIssues,
    status,
    selectedTab,
    viewMode,
    studentRows,
    ...resultTableState,
    ...resultActions,
  };
}
