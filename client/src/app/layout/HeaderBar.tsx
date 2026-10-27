import type { ReactNode } from "react";

export interface HeaderProps {
  left?: ReactNode;
  right?: ReactNode;
}

export function Header({ left, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-other-divider bg-background-paper px-4 sm:px-6 lg:px-8 print:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-3">{left}</div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{right}</div>
    </header>
  );
}
