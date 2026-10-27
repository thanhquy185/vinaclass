import { GlobalLoadingOverlay } from "@/app/providers/GlobalLoadingOverlay";
import { ToastViewport } from "@/app/providers/ToastViewport";

export function GlobalOverlays() {
  return (
    <>
      <ToastViewport />
      <GlobalLoadingOverlay />
    </>
  );
}
