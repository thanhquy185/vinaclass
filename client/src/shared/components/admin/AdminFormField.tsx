import type { ReactNode } from "react";
import type { FormItemProps } from "antd/es/form";
import { AdminFormItem } from "@/shared/components/admin/AdminFormItem";
import { cn } from "@/shared/utils/cn";

interface AdminFormFieldProps extends Omit<
  FormItemProps,
  "children" | "label" | "noStyle"
> {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminFormField({
  label,
  children,
  className,
  ...formItemProps
}: AdminFormFieldProps) {
  return (
    <div
      className={cn(
        "[&_.ant-form-item-label>label]:!text-caption min-w-0 rounded-lg bg-background-body px-3.5 py-3 [&_.ant-form-item-control-input-content]:text-sm [&_.ant-form-item-control-input-content]:font-medium [&_.ant-form-item-control-input-content]:text-text-primary [&_.ant-form-item-label>label]:!h-auto [&_.ant-form-item-label>label]:!leading-5 [&_.ant-form-item-label>label]:!text-text-secondary [&_.ant-form-item-label]:!pb-1 [&_.ant-form-item]:mb-0",
        className
      )}
    >
      <AdminFormItem {...formItemProps} label={label} colon={false}>
        {children}
      </AdminFormItem>
    </div>
  );
}
