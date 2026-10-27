import { Button as AntButton, Tooltip } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type LegacyButtonVariant = "contained" | "outline" | "text";
type LegacyButtonColor =
  | "primary"
  | "standard"
  | "success"
  | "warning"
  | "error"
  | "infor";
type LegacyButtonSize = "small" | "medium" | "large";

const variantMap: Record<
  LegacyButtonVariant,
  NonNullable<AntButtonProps["variant"]>
> = {
  contained: "solid",
  outline: "outlined",
  text: "text",
};

const colorMap: Record<
  LegacyButtonColor,
  NonNullable<AntButtonProps["color"]>
> = {
  primary: "primary",
  standard: "default",
  success: "green",
  warning: "gold",
  error: "danger",
  infor: "blue",
};

const sizeMap: Record<LegacyButtonSize, NonNullable<AntButtonProps["size"]>> = {
  small: "small",
  medium: "middle",
  large: "large",
};

export interface ButtonProps extends Omit<
  AntButtonProps,
  "type" | "variant" | "color" | "size" | "shape"
> {
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  variant?: LegacyButtonVariant;
  color?: LegacyButtonColor;
  size?: LegacyButtonSize;
  tooltip?: string;
  isButtonIcon?: boolean;
  isToolTipLeft?: boolean;
  children?: ReactNode;
}

export default function Button({
  className,
  variant = "text",
  size = "large",
  color = "standard",
  type,
  htmlType,
  tooltip,
  children,
  isButtonIcon,
  isToolTipLeft = false,
  ...props
}: ButtonProps) {
  const isContainedStandard = variant === "contained" && color === "standard";
  const button = (
    <AntButton
      {...props}
      type="default"
      variant={variantMap[variant]}
      color={colorMap[color]}
      size={sizeMap[size]}
      shape={isButtonIcon ? "circle" : undefined}
      htmlType={htmlType ?? type ?? "button"}
      className={cn(
        isContainedStandard &&
          "!border-0 !bg-secondary-main !text-primary-contrast hover:!bg-secondary-main",
        className
      )}
    >
      {children}
    </AntButton>
  );

  if (!tooltip) return button;

  return (
    <Tooltip title={tooltip} placement={isToolTipLeft ? "left" : "top"}>
      {button}
    </Tooltip>
  );
}
