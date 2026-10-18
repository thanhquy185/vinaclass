import type { ReactNode } from "react";

interface MainContentLayoutProps {
  children: ReactNode[] | ReactNode;
  classname?: string;
  hasFooter?: boolean;
}

export default function MainContentLayout({
  children,
  classname = "",
  hasFooter = true,
}: MainContentLayoutProps) {
  return (
    <div
      className={`mx-auto flex w-[1000px] max-w-[1200px] flex-col gap-2 px-4 pt-5 md:px-0 ${classname}`}
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
