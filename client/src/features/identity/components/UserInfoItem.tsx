import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface UserInfoItemProps {
  label: string;
  value?: string | null;
  children?: ReactNode;
  className?: string;
}

export function UserInfoItem({
  label,
  value,
  children,
  className,
}: UserInfoItemProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg bg-background-body px-3.5 py-3",
        className
      )}
    >
      <dt className="text-caption text-text-secondary">{label}</dt>
      <dd className="mt-1 min-w-0 text-sm font-medium text-text-primary">
        {children ?? <span className="block truncate">{value || "—"}</span>}
      </dd>
    </div>
  );
}
