import { Spin, Typography } from "antd";
import { Overlay } from "@/shared/components/ui";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";

export function GlobalLoadingOverlay() {
  const { isLoading, message } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <Overlay onClose={() => {}} dismissible={false}>
      <div
        className="flex flex-col items-center gap-4 duration-200 animate-in fade-in"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spin size="large" />

        {message && (
          <Typography.Text strong className="text-common-white drop-shadow-md">
            {message}
          </Typography.Text>
        )}
      </div>
    </Overlay>
  );
}
