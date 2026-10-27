import { Icons } from "@/assets";
import type { IconName } from "@/assets";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

export default function Icon({
  name,
  size = 24,
  className = "",
  ...props
}: IconProps) {
  const Component = Icons[name];

  if (!Component) {
    console.error(`Icon "${name}" is not defined in the icon assets`);
    return null;
  }

  return (
    <Component width={size} height={size} className={className} {...props} />
  );
}
