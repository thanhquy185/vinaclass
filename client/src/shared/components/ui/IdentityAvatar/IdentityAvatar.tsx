import { getFirstCharOfLastName } from "@/shared/utils/avatar";
import { cn } from "@/shared/utils/cn";

const avatarColors = [
  ["#ffe1b2", "#7c4200"],
  ["#d8f7c5", "#286018"],
  ["#d6edff", "#075985"],
  ["#f9d6e4", "#9d174d"],
  ["#e6ddff", "#5b21b6"],
  ["#fff0b8", "#854d0e"],
] as const;

const colorForName = (name: string) => {
  const hash = [...name].reduce(
    (value, character) => value + character.charCodeAt(0),
    0
  );
  return avatarColors[hash % avatarColors.length];
};

export interface IdentityAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeClasses = {
  small: "h-9 w-9 text-sm",
  medium: "h-11 w-11 text-base",
  large: "h-16 w-16 text-xl",
} as const;

export function IdentityAvatar({
  name,
  avatarUrl,
  size = "medium",
  className,
}: IdentityAvatarProps) {
  const [backgroundColor, color] = colorForName(name || "VinaClass");

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor, color }}
    >
      <span aria-hidden="true">{getFirstCharOfLastName(name)}</span>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}
