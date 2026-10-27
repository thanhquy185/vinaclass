import type { ReactNode } from "react";
import type { User } from "@/features/identity/types/identity";
import { IdentityAvatar } from "@/shared/components/ui";

interface UserConfirmationSummaryProps {
  user: User;
  children: ReactNode;
}

export function UserConfirmationSummary({
  user,
  children,
}: UserConfirmationSummaryProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
      <IdentityAvatar
        name={user.profile.fullName || user.username}
        avatarUrl={user.profile.avatarUrl}
        size="medium"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {user.profile.fullName || user.username}
        </p>
        <p className="text-caption truncate text-text-secondary">
          {user.username} · {user.email}
        </p>
        {children}
      </div>
    </div>
  );
}
