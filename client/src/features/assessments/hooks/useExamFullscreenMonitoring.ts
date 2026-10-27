import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ExamConfiguration } from "@/shared/types";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseExamFullscreenMonitoringOptions {
  configuration?: ExamConfiguration;
  onWarning: Dispatch<SetStateAction<boolean>>;
}

export function useExamFullscreenMonitoring({
  configuration,
  onWarning,
}: UseExamFullscreenMonitoringOptions) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (!configuration?.hasMonitoring) return;

    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        showToast(t("examTaking.fullscreenError"), "error");
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [configuration, onWarning, showToast, t]);
}
