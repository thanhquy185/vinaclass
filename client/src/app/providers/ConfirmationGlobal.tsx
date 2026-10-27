import { useCallback } from "react";
import { useConfirmStore } from "@/shared/stores/useConfirmationStore";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal/ConfirmationModal";

export function ConfirmationGlobal() {
  const { isOpen, config, isLoading, closeConfirm, setLoading } =
    useConfirmStore();

  const handleConfirm = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      await config.onConfirm();
      closeConfirm();
    } catch (error) {
      console.error("Confirm error:", error);
    } finally {
      setLoading(false);
    }
  }, [config, closeConfirm, setLoading]);

  const handleCancel = useCallback(() => {
    if (config?.onCancel) config.onCancel();
    closeConfirm();
  }, [config, closeConfirm]);

  if (!isOpen || !config) return null;

  return (
    <ConfirmationModal
      {...config}
      isOpen={isOpen}
      isLoading={isLoading}
      onClose={handleCancel}
      onConfirm={handleConfirm}
    />
  );
}
