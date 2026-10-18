import Logo from "@/components/atomic/molecules/Logo/Logo";
import ExamResultOverview from "@/components/atomic/organisms/ExamResultOverview/ExamResultOverview";

export default function ResultDoTestPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background-paper text-text-secondary">
      <header className="flex w-full justify-center px-4">
        <div className="w-[668px] pb-6 pt-6">
          <Logo classname="text-text-secondary font-bold" />
        </div>
      </header>

      <main className="mb-20 flex w-full flex-col items-center px-4 py-5">
        <ExamResultOverview />
      </main>
    </div>
  );
}
