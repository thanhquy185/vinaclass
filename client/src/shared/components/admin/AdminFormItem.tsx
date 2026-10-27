import { Form } from "antd";
import type { FormItemProps } from "antd/es/form";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type AdminFormItemProps = Omit<FormItemProps, "children"> & {
  children: ReactNode;
};

export function AdminFormItem({
  className,
  children,
  ...props
}: AdminFormItemProps) {
  return (
    <Form.Item {...props} className={cn("mb-0", className)}>
      {children}
    </Form.Item>
  );
}
