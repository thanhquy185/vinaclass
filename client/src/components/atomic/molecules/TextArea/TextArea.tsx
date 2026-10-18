import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  classNameParent?: string;
  hasBorder?: boolean; // Nếu nguyên tử Input của bạn có prop này
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    { label, error, placeholder = "", classNameParent, className, ...props },
    ref
  ) => {
    return (
      <div
        className={`flex flex-col gap-1 text-text-primary ${classNameParent}`}
      >
        {/* Label */}
        {label && (
          <div className="text-input-text text-sm font-medium">{label}</div>
        )}

        {/* Textarea Core */}
        <textarea
          ref={ref}
          placeholder={placeholder}
          className={`text-body-2 min-h-[100px] w-full rounded-md border border-other-outlined-border bg-background-body-background px-3 py-2 outline-none transition-all placeholder:text-text-disabled focus:border-primary-main focus:ring-1 focus:ring-primary-main disabled:cursor-not-allowed disabled:bg-action-disabled ${error ? "border-alert-error-content" : ""} ${className} `}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <span className="text-caption mt-0.5 text-alert-error-content">
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
