import type { ReactNode } from "react";

interface MainContentLayoutProps {
  children: ReactNode;
  className?: string;
  /** @deprecated Use className instead. */
  classname?: string;
  hasFooter?: boolean;
  width?: "standard" | "wide";
}

export default function MainContentLayout({
  children,
  className,
  classname,
  hasFooter = true,
  width = "standard",
}: MainContentLayoutProps) {
  return (
    <div
      className={`mx-auto flex w-full min-w-0 ${width === "wide" ? "max-w-[1440px]" : "max-w-[1000px]"} flex-col gap-2 px-4 pb-8 pt-6 md:px-6 lg:px-8 ${className ?? classname ?? ""}`}
    >
      {children}

      {/* Footer */}
      {hasFooter && (
        <div className="text-body-1 flex flex-col justify-between gap-3 rounded-md bg-background-body-background px-6 py-4 text-text-secondary sm:flex-row">
          <span>
            <span className="text-primary-main">SGU Test</span> © 2026
          </span>
          <span>
            Made with ❤️ by <span className="text-primary-main">MaChHiAn</span>
          </span>
        </div>
      )}
    </div>
  );
}
