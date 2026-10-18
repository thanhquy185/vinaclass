import { Button } from "@/components/atomic/atoms";
import { useExamStore } from "@/stores/useExamStore";
import { Outlet, useNavigate } from "react-router-dom";

export default function DoTestPage() {
  const { mode, resetExam } = useExamStore();
  const navigate = useNavigate();

  const handleExitPreview = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit full-screen: ${err.message}`);
      });
    }

    resetExam();

    // Xác định số bước nhảy ngược dựa trên path hiện tại
    const path = location.pathname;

    if (path.includes("/result/")) {
      navigate(-2); // Từ Result -> Doing -> Instruction -> Out
    } else if (path.includes("/doing")) {
      navigate(-2); // Từ Doing -> Instruction -> Out
    } else {
      navigate(-1); // Từ Instruction (index) -> Out
    }
  };
  return (
    <div className="fixed inset-0 select-none overflow-x-hidden bg-background-body-background">
      {/* Outlet sẽ render ExamInstruction hoặc ExamDoing tùy theo URL */}
      <Outlet />
      {/* 5. Preview Mode Bar */}
      {mode === "PREVIEW" && (
        <footer className="fixed bottom-4 left-1/2 flex w-full max-w-[520px] -translate-x-1/2 items-center justify-between gap-2 rounded-md bg-background-extra-bg p-2 text-primary-contrast">
          <span className="text-caption border-r border-primary-contrast px-2 text-primary-main">
            CHẾ ĐỘ DEMO
          </span>
          <div className="item-center flex flex-1">
            <span className="text-caption">
              Tính năng giới hạn.{" "}
              <button className="underline">Xem thêm</button>
            </span>
          </div>
          <Button
            variant={"contained"}
            color={"standard"}
            size={"small"}
            className="!px-4 text-[12px]"
            onClick={handleExitPreview}
          >
            Thoát chế độ
          </Button>
        </footer>
      )}
    </div>
  );
}
