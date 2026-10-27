import { Button } from "@/shared/components/ui";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useExamPreviewController } from "@/features/assessments/hooks/useExamPreviewController";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";

export default function DoTestPage() {
  const { mode, handleExitPreview } = useExamPreviewController();
  const resetExam = useExamSessionStore((state) => state.resetExam);
  const { t } = useTranslation();
  const { pathname } = useLocation();

  useEffect(
    () => () => {
      if (useExamSessionStore.getState().mode === "PREVIEW") resetExam();
    },
    [resetExam],
  );

  return (
    <div
      className={`fixed inset-0 z-[60] overflow-x-hidden bg-background-body-background ${
        mode === "STUDENT" ? "select-none" : ""
      }`}
    >
      {/* The outlet renders the instruction or exam flow based on the URL. */}
      <Outlet />
      {/* 5. Preview Mode Bar */}
      {mode === "PREVIEW" && !pathname.endsWith("/take") && (
        <footer
          aria-label={t("assessmentPreview.bannerLabel")}
          className="fixed bottom-4 right-4 z-40 flex w-[calc(100%-2rem)] max-w-[420px] items-center gap-3 rounded-xl border border-primary-main/20 bg-background-paper p-3 text-text-secondary shadow-lg sm:bottom-5 sm:right-5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-main/10 text-primary-main">
            <Eye size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-caption block font-semibold text-primary-main">
              {t("assessmentPreview.badge")}
            </span>
            <span className="text-caption block truncate text-text-secondary">
              {t("assessmentPreview.description")}
            </span>
          </div>
          <Button
            variant={"contained"}
            color={"standard"}
            size={"small"}
            className="!h-9 !shrink-0 !rounded-lg !px-3 text-xs"
            onClick={handleExitPreview}
            aria-label={t("assessmentPreview.exit")}
          >
            {t("assessmentPreview.exit")}
          </Button>
        </footer>
      )}
    </div>
  );
}
