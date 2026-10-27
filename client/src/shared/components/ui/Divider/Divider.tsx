import { Divider as AntDivider } from "antd";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface DividerProps {
  children?: ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted";
  thickness?: number;
}

const Divider = ({
  children,
  className = "",
  orientation = "horizontal",
  variant = "solid",
  thickness = 1,
}: DividerProps) => {
  const isHorizontal = orientation === "horizontal";
  return (
    <AntDivider
      type={isHorizontal ? "horizontal" : "vertical"}
      dashed={variant === "dashed"}
      className={cn(
        isHorizontal
          ? "my-0 w-full border-other-outlined-border"
          : "my-0 inline-block min-h-[1em] self-stretch border-other-outlined-border align-middle",
        children &&
          "[&_.ant-divider-inner-text]:text-body-1 [&_.ant-divider-inner-text]:px-3 [&_.ant-divider-inner-text]:text-text-secondary",
        className
      )}
      style={
        isHorizontal
          ? {
              borderBlockStartStyle: variant,
              borderBlockStartWidth: thickness,
            }
          : {
              borderInlineStartStyle: variant,
              borderInlineStartWidth: thickness,
            }
      }
    >
      {isHorizontal ? children : undefined}
    </AntDivider>
  );
};

export default Divider;
