import type { ReactNode } from "react";

interface AssessmentSummaryMetricProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export function AssessmentSummaryMetric({
  icon,
  label,
  value,
}: AssessmentSummaryMetricProps) {
  return (
    <div className="min-w-0 rounded-lg bg-background-body-background p-3">
      <div className="flex items-center gap-2 text-text-disabled">
        {icon}
        <span className="text-caption truncate">{label}</span>
      </div>
      <div className="text-body-2 mt-2 break-words font-medium text-text-primary">
        {value}
      </div>
    </div>
  );
}
