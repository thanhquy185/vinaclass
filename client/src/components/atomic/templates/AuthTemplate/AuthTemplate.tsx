import type { ReactNode } from "react";
import Illustration from "@/assets/images/Illustration.png";

type Props = {
  children: ReactNode;
};

export default function AuthTemplate({ children }: Props) {
  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden bg-background-body-background px-4 pt-[60px]">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <img
          src={Illustration}
          alt="Illustration Background"
          className="absolute bottom-[40px] right-0 h-auto object-contain"
        />
      </div>
      <div className="z-10 h-fit w-full max-w-[450px] rounded-lg bg-background-body-background px-7 pb-9 pt-[58px] shadow-custom">
        {children}
      </div>
    </div>
  );
}
