import { useState } from "react";
import type { ExamConfiguration } from "@/shared/types";
import type {
  ExamMode,
  UpdateViolation,
} from "@/features/assessments/types/examMonitoring";
import { useExamFullscreenMonitoring } from "@/features/assessments/hooks/useExamFullscreenMonitoring";
import { useExamFocusMonitoring } from "@/features/assessments/hooks/useExamFocusMonitoring";
import { useExamContentRestrictions } from "@/features/assessments/hooks/useExamContentRestrictions";

interface UseExamMonitoringOptions {
  configuration?: ExamConfiguration;
  mode: ExamMode;
  attemptId?: number;
  violationCount: number;
  onViolation: () => void;
  updateViolation: UpdateViolation;
}

export function useExamMonitoring({
  configuration,
  mode,
  attemptId,
  violationCount,
  onViolation,
  updateViolation,
}: UseExamMonitoringOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [showKicked, setShowKicked] = useState(false);
  const activeConfiguration = mode === "STUDENT" ? configuration : undefined;

  useExamFullscreenMonitoring({
    configuration: activeConfiguration,
    onWarning: setShowWarning,
  });
  useExamFocusMonitoring({
    configuration: activeConfiguration,
    mode,
    attemptId,
    violationCount,
    onViolation,
    updateViolation,
    onWarning: setShowWarning,
    onKicked: setShowKicked,
  });
  useExamContentRestrictions(activeConfiguration);

  return { showWarning, showKicked, setShowWarning };
}
