import type { ReactNode } from "react";
import { AdminFormSection } from "@/shared/components/admin";

interface UserInfoSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function UserInfoSection({
  title,
  children,
  className,
}: UserInfoSectionProps) {
  return (
    <AdminFormSection title={title} className={className}>
      {children}
    </AdminFormSection>
  );
}
