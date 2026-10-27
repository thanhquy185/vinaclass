import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import type { ExamConfiguration } from "@/shared/types";
import type {
  ExamMode,
  UpdateViolation,
} from "@/features/assessments/types/examMonitoring";

interface UseExamFocusMonitoringOptions {
  configuration?: ExamConfiguration;
  mode: ExamMode;
  attemptId?: number;
  violationCount: number;
  onViolation: () => void;
  updateViolation: UpdateViolation;
  onWarning: Dispatch<SetStateAction<boolean>>;
  onKicked: Dispatch<SetStateAction<boolean>>;
}

export function useExamFocusMonitoring({
  configuration,
  mode,
  attemptId,
  violationCount,
  onViolation,
  updateViolation,
  onWarning,
  onKicked,
}: UseExamFocusMonitoringOptions) {
  const isTabOut = useRef(false);

  useEffect(() => {
    if (
      !configuration ||
      (!configuration.hasMonitoring && !configuration.isLimitSwitchTab)
    )
      return;

    const handleAction = () => {
      if (document.hidden || !document.hasFocus()) {
        isTabOut.current = true;
      } else if (isTabOut.current) {
        isTabOut.current = false;

        if (configuration.isLimitSwitchTab) {
          onViolation();

          const newCount = violationCount + 1;

          if (attemptId && mode === "STUDENT") {
            updateViolation({ examAttemptId: attemptId, count: newCount });
          }

          const limit = configuration.tabSwitchLimit ?? 3;

          if (violationCount + 1 >= limit) {
            onKicked(true);
          } else {
            onWarning(true);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleAction);
    window.addEventListener("focus", handleAction);
    return () => {
      document.removeEventListener("visibilitychange", handleAction);
      window.removeEventListener("focus", handleAction);
    };
  }, [
    violationCount,
    onViolation,
    configuration,
    attemptId,
    mode,
    updateViolation,
    onWarning,
    onKicked,
  ]);
}
