import Logo from "@/shared/components/ui/Logo/Logo";
import ExamResultOverview from "@/features/assessments/components/exam/ExamResultOverview";
import { useExamPreviewController } from "@/features/assessments/hooks/useExamPreviewController";

export default function ResultDoTestPage() {
  const { mode, handleExitPreview } = useExamPreviewController();

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background-paper text-text-secondary">
      <header className="flex w-full justify-center px-4">
        <div className="w-[668px] pb-6 pt-6">
          <Logo className="font-bold text-text-secondary" />
        </div>
      </header>

      <main className="mb-20 flex w-full flex-col items-center px-4 py-5">
        <ExamResultOverview
          onCancel={mode === "PREVIEW" ? handleExitPreview : undefined}
        />
      </main>
    </div>
  );
}
