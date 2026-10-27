import Icon from "../Icon/Icon";

export interface LogoProps {
  large?: boolean;
  className?: string;
  /** @deprecated Use className instead. */
  classname?: string;
}
export default function Logo({
  large = false,
  className,
  classname,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2`}>
      <Icon name="logoIcon" size={large ? 45 : 40} />
      <strong
        className={`text-text-primary ${className ?? classname ?? ""} ${large ? "text-h5" : "text-h6"}`}
      >
        VinaClass
      </strong>
    </div>
  );
}
