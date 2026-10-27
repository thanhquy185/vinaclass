import type { ReactNode } from "react";

export interface SummaryStatCardProps {
  label: string;
  value: string | number;
  accentClassName: string;
  icon?: ReactNode;
  isLoading?: boolean;
}

export function SummaryStatCard({
  label,
  value,
  accentClassName,
  icon,
  isLoading = false,
}: SummaryStatCardProps) {
  return (
    <article className="flex min-h-[82px] min-w-0 items-center gap-3 rounded-xl border border-other-outlined-border bg-background-paper px-4 py-3 shadow-sm sm:px-5">
      <span className={`h-10 w-1 shrink-0 rounded-full ${accentClassName}`} />
      <div className="min-w-0 flex-1">
        <p className="text-caption truncate font-medium text-text-secondary">
          {label}
        </p>
        <p className="mt-0.5 text-heading-6 font-bold text-text-primary">
          {isLoading ? "—" : value}
        </p>
      </div>
      {icon && (
        <span className="text-text-disabled" aria-hidden="true">
          {icon}
        </span>
      )}
    </article>
  );
}
