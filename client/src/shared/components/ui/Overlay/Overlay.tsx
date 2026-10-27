import { Modal } from "antd";
import type { ReactNode } from "react";

export interface OverlayProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** @deprecated Use className instead. */
  classname?: string;
  /** Prevents dismissal while the overlay represents a blocking operation. */
  dismissible?: boolean;
  zIndex?: number;
}

export const Overlay = ({
  onClose,
  children,
  className,
  classname,
  dismissible = true,
  zIndex = 1000,
}: OverlayProps) => {
  const rootClassName = className ?? classname;

  return (
    <Modal
      open
      onCancel={onClose}
      title={null}
      footer={null}
      closable={false}
      mask={{ closable: dismissible }}
      keyboard={dismissible}
      centered
      width="max-content"
      zIndex={zIndex}
      rootClassName={rootClassName}
      classNames={{
        container: "!rounded-lg",
      }}
      styles={{
        container: {
          maxWidth: "calc(100vw - 32px)",
          padding: 0,
          background: "transparent",
          boxShadow: "none",
        },
        body: {
          maxHeight: "calc(100vh - 32px)",
          overflow: "auto",
          padding: 0,
        },
      }}
    >
      {children}
    </Modal>
  );
};
