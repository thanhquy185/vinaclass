import { Icons } from "@/assets";
import type { IconName } from "@/assets";

interface IconProps extends React.SVGProps<SVGSVGElement> {
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
    console.error(`Icon "${name}" không tồn tại trong thư mục assets/icons`);
    return null;
  }

  return (
    <Component width={size} height={size} className={className} {...props} />
  );
}
