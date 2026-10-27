import { useParams } from "react-router-dom";
import { useExamDetail } from "@/features/assessments/hooks/useExamQueries";
import { useTestDetailActions } from "@/features/assessments/hooks/useTestDetailActions";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";

export function useTestDetailPageController() {
  const { id } = useParams();
  const examId = Number(id);
  const storedExam = useExamDraftStore((state) => state.testData);
  const examQuery = useExamDetail(examId);

  // Reuse persisted data only when it belongs to the requested route.
  const displayData =
    examQuery.exam ?? (storedExam?.id === examId ? storedExam : undefined);
  const actions = useTestDetailActions(displayData);

  return {
    examQuery,
    displayData,
    actions,
  };
}
