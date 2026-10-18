import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

const buttonVariants = cva(
  "group relative text-nowrap flex items-center gap-2 rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        contained: "",
        outline: "border bg-transparent hover:bg-action-hover",
        text: "bg-transparent hover:bg-action-hover",
      },
      size: {
        small:
          "px-1 py-1 text-[13px] font-medium leading-[22px] tracking-[0.46px] uppercase-none",
        medium:
          "px-2 py-1.5 text-[14px] font-medium leading-[24px] tracking-[0.4px]",
        large:
          "px-3 py-2 text-[15px] font-medium leading-[26px] tracking-[0.46px]",
      },
      color: {
        primary: "", // Sẽ xử lý ở compoundVariants
        standard: "",
        success: "",
        warning: "",
        error: "",
        infor: "",
      },
    },
    compoundVariants: [
      // 1. Contained States
      {
        variant: "contained",
        color: "primary",
        className:
          "text-primary-contrast bg-primary-main hover:bg-primary-main",
      },
      {
        variant: "contained",
        color: "success",
        className:
          "text-primary-contrast bg-alert-success-content hover:bg-alert-success-content",
      },
      {
        variant: "contained",
        color: "warning",
        className:
          "text-primary-contrast bg-alert-warning-content hover:bg-alert-warning-content",
      },
      {
        variant: "contained",
        color: "error",
        className:
          "text-primary-contrast bg-alert-error-content hover:bg-alert-error-content",
      },
      {
        variant: "contained",
        color: "infor",
        className:
          "text-primary-contrast bg-alert-info-content hover:bg-alert-info-content",
      },
      {
        variant: "contained",
        color: "standard",
        className:
          "text-primary-contrast bg-secondary-main hover:bg-secondary-main",
      },

      // 2. Outline States
      {
        variant: "outline",
        color: "primary",
        className:
          "border-primary-main text-primary-main hover:bg-action-hover",
      },
      {
        variant: "outline",
        color: "success",
        className:
          "border-alert-success-content text-alert-success-content hover:bg-action-hover",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "border-alert-warning-content text-alert-warning-content hover:bg-action-hover",
      },
      {
        variant: "outline",
        color: "error",
        className:
          "border-alert-error-content text-alert-error-content hover:bg-action-hover",
      },
      {
        variant: "outline",
        color: "infor",
        className:
          "border-alert-infor-content text-alert-infor-content hover:bg-action-hover",
      },
      {
        variant: "outline",
        color: "standard",
        className:
          "border-other-outlined-border text-text-secondary hover:bg-action-hover",
      },

      // 3. Text States
      {
        variant: "text",
        color: "primary",
        className: "text-primary-main",
      },
      {
        variant: "text",
        color: "success",
        className: "text-alert-success-content",
      },
      {
        variant: "text",
        color: "warning",
        className: "text-alert-warning-content ",
      },
      {
        variant: "text",
        color: "error",
        className: "text-alert-error-content",
      },
      {
        variant: "text",
        color: "infor",
        className: "text-alert-info-content",
      },
      {
        variant: "text",
        color: "standard",
        className: "text-text-primary",
      },
    ],
    defaultVariants: {
      variant: "text",
      size: "large",
      color: "standard",
    },
  }
);

interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  tooltip?: string;
  isButtonIcon?: boolean;
  isToolTipLeft?: boolean;
}

export default function Button({
  className,
  variant,
  size,
  color,
  tooltip,
  children,
  isButtonIcon,
  isToolTipLeft = false,
  ...props
}: ButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!tooltip || !tooltipRef.current) return;

    // 3. Xử lý logic isToolTipLeft (nếu muốn)
    // Nếu isToolTipLeft = true, dịch chuyển tooltip sang trái con trỏ thay vì sang phải
    const tooltipWidth = tooltipRef.current.offsetWidth || 0;
    const x = isToolTipLeft ? e.clientX - tooltipWidth - 12 : e.clientX + 12;
    const y = e.clientY + 12;

    tooltipRef.current.style.left = `${x}px`;
    tooltipRef.current.style.top = `${y}px`;
  };
  return (
    <button
      // Khi truyền color vào buttonVariants, giờ đây nó sẽ khớp với kiểu dữ liệu của CVA
      className={cn(
        buttonVariants({ variant, size, color }),
        `${isButtonIcon && "rounded-full"}`,
        className
      )}
      onMouseEnter={() => setIsVisible(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {tooltip && (
        <span
          ref={tooltipRef}
          className={cn(
            "pointer-events-none fixed z-50 whitespace-nowrap rounded bg-other-tooltip px-3 py-1.5 text-xs text-common-white opacity-0 shadow-md transition-opacity group-hover:opacity-100",
            // Logic xử lý vị trí
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0" // Hiện bên phải (Mặc định)
          )}
          style={{
            left: 0,
            top: 0,
            transform: "translate3d(0,0,0)", // Tối ưu GPU
          }}
        >
          {tooltip}
        </span>
      )}
    </button>
  );
}
