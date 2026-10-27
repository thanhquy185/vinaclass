import { useLocation, useNavigate } from "react-router-dom";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";

export function useExamPreviewController() {
  const mode = useExamSessionStore((state) => state.mode);
  const previewReturnTo = useExamSessionStore((state) => state.previewReturnTo);
  const resetExam = useExamSessionStore((state) => state.resetExam);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleExitPreview = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((error) => {
        console.error(`Error attempting to exit full-screen: ${error.message}`);
      });
    }

    resetExam();

    if (previewReturnTo) {
      navigate(previewReturnTo, { replace: true });
      return;
    }

    if (pathname.includes("/result/")) {
      navigate(-2); // Skip the result and instruction routes.
    } else if (pathname.includes("/doing")) {
      navigate(-2); // Skip the instruction route.
    } else {
      navigate(-1); // Leave the instruction route.
    }
  };

  return { mode, handleExitPreview };
}
