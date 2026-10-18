import { Loader2 } from "lucide-react";
import { Overlay } from "../Overlay/Overlay";
import { useLoadingStore } from "@/stores/useLoading.store";

export function LoadingGlobal() {
  const { isLoading, message } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <Overlay onClose={() => {}} classname="!z-[1000]">
      <div className="flex flex-col items-center gap-4 duration-200 animate-in fade-in">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <Loader2
            className="animate-spin text-primary-contrast"
            size={48}
            // Đảm bảo không có CSS nào đè mất animation
            style={{ animationDuration: "1s" }}
          />
        </div>

        {message && (
          <p className="text-body-1-semibold tracking-wide text-common-white drop-shadow-md">
            {message}
          </p>
        )}
      </div>
    </Overlay>
  );
}
