import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/shared/utils/cn";

type AdminPanelElement = ElementType;

export type AdminPanelProps = {
  as?: AdminPanelElement;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"section">, "className">;

export function AdminPanel({
  as,
  className,
  ...props
}: AdminPanelProps) {
  const Component = as ?? "section";

  return (
    <Component
      {...props}
      className={cn(
        "rounded-xl border border-other-outlined-border bg-background-paper shadow-sm",
        className
      )}
    />
  );
}
