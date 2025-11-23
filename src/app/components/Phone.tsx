import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  dark?: boolean;
}

const Phone = ({ imgSrc, className, dark = false, ...props }: PhoneProps) => {
  return (
    <div
      className={cn(
        "relative pointer-events-none z-50 overflow-hidden w-80 h-auto",
        className
      )}
      {...props}
    >
      <img
        src={
          dark
            ? "/phone-template-drark-edge.png"
            : "/phone-template-white-edges.png"
        }
        className="pointer-events-none z-50 select-none w-full h-auto"
        alt="phone image"
      />
      <div className="absolute -z-10 inset-0">
        <img className="object-cover w-full h-full" src={imgSrc} />
      </div>
    </div>
  );
};

export default Phone;
