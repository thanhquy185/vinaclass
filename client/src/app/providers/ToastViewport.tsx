import { useToastStore } from "@/shared/stores/useToastStore";
import { Toast } from "@/shared/components/ui";

export function ToastViewport() {
  const { toasts, hideToast } = useToastStore();

  return (
    <div className="fixed left-1/2 top-5 z-[9999] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-3 px-4">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => hideToast(t.id)}
        />
      ))}
    </div>
  );
}
