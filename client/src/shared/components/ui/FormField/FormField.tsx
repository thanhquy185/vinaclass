import { Form } from "antd";
import type { FormItemProps } from "antd/es/form";

export type FormFieldProps = Omit<FormItemProps, "children"> & {
  children: NonNullable<FormItemProps["children"]>;
};

export function FormField({ children, ...itemProps }: FormFieldProps) {
  return <Form.Item {...itemProps}>{children}</Form.Item>;
}
