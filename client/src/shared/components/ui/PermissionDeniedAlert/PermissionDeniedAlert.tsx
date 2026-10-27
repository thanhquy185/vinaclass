import { Alert } from "antd";
import type { ReactNode } from "react";

export interface PermissionDeniedAlertProps {
  message: ReactNode;
  className?: string;
}

export function PermissionDeniedAlert({
  message,
  className,
}: PermissionDeniedAlertProps) {
  return (
    <Alert className={className} type="warning" showIcon message={message} />
  );
}
