import { Overlay } from "@/shared/components/ui/Overlay/Overlay";
import ExamResultOverview from "@/features/assessments/components/exam/ExamResultOverview";

interface ExamResultModalProps {
  onClose: () => void;
}

export default function ExamResultModal({ onClose }: ExamResultModalProps) {
  return (
    <Overlay onClose={onClose}>
      <main className="mb-20 flex max-h-[90vh] w-fit flex-col items-center overflow-y-auto rounded-lg bg-background-body-background px-8 py-8">
        <ExamResultOverview onCancel={onClose} />
      </main>
    </Overlay>
  );
}
