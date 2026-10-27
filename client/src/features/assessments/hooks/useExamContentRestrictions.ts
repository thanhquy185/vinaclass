import { useEffect } from "react";
import type { ExamConfiguration } from "@/shared/types";

export function useExamContentRestrictions(configuration?: ExamConfiguration) {
  useEffect(() => {
    const shouldBlockCopy = configuration?.allowCopy === false;
    const shouldBlockPrint = configuration?.allowPrint === false;
    if (!shouldBlockCopy && !shouldBlockPrint) return;

    const handlePrevent = (event: Event) => {
      event.preventDefault();
    };

    if (shouldBlockCopy) {
      document.addEventListener("contextmenu", handlePrevent);
      document.addEventListener("copy", handlePrevent);
      document.addEventListener("paste", handlePrevent);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const isControl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const blockedCopyShortcut =
        shouldBlockCopy && isControl && ["c", "v", "s", "u"].includes(key);
      const blockedPrintShortcut = shouldBlockPrint && isControl && key === "p";

      if (
        blockedCopyShortcut ||
        blockedPrintShortcut ||
        (shouldBlockCopy && event.key === "F12")
      ) {
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    const printStyle = shouldBlockPrint
      ? document.createElement("style")
      : null;
    if (printStyle) {
      printStyle.innerHTML =
        "@media print { body { display: none !important; } }";
      document.head.appendChild(printStyle);
    }

    return () => {
      if (shouldBlockCopy) {
        document.removeEventListener("contextmenu", handlePrevent);
        document.removeEventListener("copy", handlePrevent);
        document.removeEventListener("paste", handlePrevent);
      }
      document.removeEventListener("keydown", handleKeyDown);
      if (printStyle?.parentNode) document.head.removeChild(printStyle);
    };
  }, [configuration]);
}
