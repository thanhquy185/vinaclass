import { Icon } from "../../atoms";

interface LogoProps {
  large?: boolean;
  classname?: string;
}
export default function Logo({ large = false, classname }: LogoProps) {
  return (
    <div className={`flex items-center gap-2`}>
      <Icon name="logoIcon" size={large ? 45 : 40} />
      <strong
        className={`text-text-primary ${classname} ${large ? "text-h5" : "text-h6"}`}
      >
        MaHiChAn
      </strong>
    </div>
  );
}
