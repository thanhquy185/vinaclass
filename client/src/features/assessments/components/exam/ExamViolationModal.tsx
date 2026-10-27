import { useTranslation } from "react-i18next";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface ExamViolationModalProps {
  type: "warning" | "kicked";
  count: number;
  maxCount: number;
  onConfirm: () => void;
}

export function ExamViolationModal({
  type,
  count,
  maxCount,
  onConfirm,
}: ExamViolationModalProps) {
  const { t } = useTranslation("common");
  const isKicked = type === "kicked";

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm transition-all ${isKicked ? "bg-black/70" : "bg-black/40"}`}
      role="presentation"
    >
      <section
        aria-labelledby="exam-violation-title"
        aria-modal="true"
        className={`flex w-full max-w-sm flex-col items-center rounded-2xl bg-background-body-background p-8 text-center shadow-2xl duration-200 animate-in zoom-in ${isKicked ? "border-t-4 border-error-main" : ""}`}
        role="dialog"
      >
        {isKicked ? (
          <ShieldAlert
            aria-hidden="true"
            size={60}
            className="mb-4 text-error-main"
          />
        ) : (
          <AlertTriangle
            aria-hidden="true"
            size={50}
            className="mb-4 text-warning-main"
          />
        )}

        <h2
          className={`text-h5 mb-2 font-bold ${isKicked ? "text-error-main" : "text-text-primary"}`}
          id="exam-violation-title"
        >
          {isKicked
            ? t("examTaking.violation.kickedTitle")
            : t("examTaking.violation.warningTitle")}
        </h2>

        <p className="text-body-2 mb-8 text-text-secondary">
          {isKicked
            ? t("examTaking.violation.limitMessage", { maxCount })
            : t("examTaking.violation.warningMessage", { count, maxCount })}
        </p>

        <Button
          color={isKicked ? "error" : "primary"}
          variant="contained"
          onClick={onConfirm}
        >
          {isKicked
            ? t("examTaking.violation.viewResult")
            : t("examTaking.violation.understood")}
        </Button>
      </section>
    </div>
  );
}
