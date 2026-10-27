import { useEffect } from "react";
import { useExams } from "@/features/assessments/hooks/useExamQueries";
import { useExamListState } from "@/features/assessments/hooks/useExamListState";
import { usePermissionNavigation } from "@/features/authorization/hooks/usePermissionNavigation";
import { getLegacyFunctionActions } from "@/features/authorization/utils/legacyActions";
import { useAuthStore } from "@/shared/stores/useAuthStore";

const EXAM_FUNCTION = "de_thi";
const EXAM_ROUTE = "exams";
const EXAM_ACTIONS = ["view", "create", "update", "delete"] as const;

export function useTestPageController() {
  const { role } = useAuthStore();
  const {
    hasRouteAction,
    hasFunctionAction,
    isEnabled: isPermissionV2Enabled,
    isLoading: isPermissionLoading,
    isError: isPermissionError,
    refetch: refetchPermissions,
  } = usePermissionNavigation();

  const legacyActions = getLegacyFunctionActions(
    role?.roleDetails ?? [],
    EXAM_FUNCTION,
  );
  const actions = isPermissionV2Enabled
    ? EXAM_ACTIONS.filter((action) =>
        hasRouteAction(EXAM_ROUTE, action.toUpperCase()),
      )
    : legacyActions;
  const canView = actions.includes("view");
  const canCreate =
    actions.includes("create") &&
    (!isPermissionV2Enabled || hasFunctionAction(EXAM_FUNCTION, "ASSIGN"));

  const examsQuery = useExams(canView);
  const examList = useExamListState({ exams: examsQuery.exams });

  useEffect(() => {
    document
      .getElementById("test-page-toolbar")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [examList.currentPage]);

  return {
    actions,
    canView,
    canCreate,
    isPermissionV2Enabled,
    isPermissionLoading,
    isPermissionError,
    refetchPermissions,
    examsQuery,
    examList,
  };
}
