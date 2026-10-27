import { IdentityAvatar } from "@/shared/components/ui";

interface UserIdentityCardProps {
  name: string;
  secondaryText: string;
  avatarUrl?: string | null;
  roleLabel: string;
  statusLabel: string;
  isLocked: boolean;
}

export function UserIdentityCard({
  name,
  secondaryText,
  avatarUrl,
  roleLabel,
  statusLabel,
  isLocked,
}: UserIdentityCardProps) {
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-other-divider bg-background-paper p-4 shadow-sm sm:p-5">
      <IdentityAvatar
        name={name}
        avatarUrl={avatarUrl}
        size="large"
        className="ring-4 ring-background-body"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-semibold text-text-primary">
          {name}
        </h3>
        <p className="mt-1 truncate text-sm text-text-secondary">
          {secondaryText}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-action-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
            {roleLabel}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              isLocked
                ? "bg-custom-background-error-background text-alert-error-content"
                : "bg-custom-background-success-background text-alert-success-content"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
