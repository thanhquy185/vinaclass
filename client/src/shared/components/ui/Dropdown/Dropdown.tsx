import { Dropdown as AntDropdown } from "antd";
import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export const Dropdown = ({
  trigger,
  children,
  align = "left",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const triggerElement = isValidElement(trigger) ? (
    cloneElement(
      trigger as ReactElement<{
        "aria-controls"?: string;
        "aria-expanded"?: boolean;
      }>,
      { "aria-controls": menuId, "aria-expanded": isOpen }
    )
  ) : (
    <button
      type="button"
      aria-controls={menuId}
      aria-expanded={isOpen}
      className="inline-flex text-text-primary"
    >
      {trigger}
    </button>
  );

  return (
    <AntDropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={["click"]}
      placement={align === "right" ? "bottomRight" : "bottomLeft"}
      popupRender={() => (
        <div
          id={menuId}
          className="w-56 rounded-md border border-other-outlined-border bg-background-paper py-1 shadow-lg"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    >
      {triggerElement}
    </AntDropdown>
  );
};

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  variant?: "default" | "error";
}

export const DropdownItem = ({
  children,
  onClick,
  className = "",
  icon,
  variant = "default",
}: DropdownItemProps) => {
  // Select the text color from the item variant.
  const variantClasses =
    variant === "error"
      ? "text-error-main hover:bg-error-background"
      : "text-text-primary hover:bg-action-hover";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-body-2 flex w-full items-center px-4 py-2 transition-colors ${variantClasses} ${className}`}
    >
      {icon && (
        <span className="mr-3 flex items-center justify-center">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
