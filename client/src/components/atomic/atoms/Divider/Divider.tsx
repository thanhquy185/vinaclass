import type { ReactNode } from "react";

interface DividerProps {
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

  // Mapping class để code sạch hơn
  const borderStyles = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
  };

  if (!isHorizontal) {
    return (
      <div
        className={`inline-block min-h-[1em] self-stretch border-l ${borderStyles[variant]} border-other-outlined-border ${className}`}
        style={{ borderLeftWidth: thickness }}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <div
      className={`flex w-full items-center ${className}`}
      role="separator"
      aria-orientation="horizontal"
    >
      <div
        className={`flex-grow border-t ${borderStyles[variant]} border-other-outlined-border`}
        style={{ borderTopWidth: thickness }}
      />

      {children && (
        <>
          <span className="text-body-1 whitespace-nowrap px-3 text-text-secondary">
            {children}
          </span>
          <div
            className={`flex-grow border-t ${borderStyles[variant]} border-other-outlined-border`}
            style={{ borderTopWidth: thickness }}
          />
        </>
      )}
    </div>
  );
};

export default Divider;
