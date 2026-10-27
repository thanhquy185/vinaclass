import { useEffect, useState } from "react";

interface ResultProgressBarProps {
  percent: number;
  colorClass: string;
}

export const ResultProgressBar = ({
  percent,
  colorClass,
}: ResultProgressBarProps) => {
  const [currentWidth, setCurrentWidth] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentWidth(percent), 50);
    return () => window.clearTimeout(timer);
  }, [percent]);

  return (
    <div className="h-2 w-32 overflow-hidden rounded-full bg-action-focus">
      <div
        className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{
          width: `${currentWidth}%`,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};
